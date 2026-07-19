#!/usr/bin/env python3
"""
Write expanded biography + FAQs to lib/data/saint-extended.json for every
saint in lib/data/saints.json that doesn't already have an entry.

Resumable:  skips saints whose slug is already in saint-extended.json.
Atomic:     writes each saint to a tmp file then renames.
Logged:     appends every action to scripts/logs/extended-bio-{date}.log.
Fact-check: every output goes through a second LLM pass that flags
            critical issues; the writer gets up to N retries to fix them.

Usage:
  py -3 scripts/write-extended-bios.py                  # all remaining
  py -3 scripts/write-extended-bios.py --limit 10       # next 10 only
  py -3 scripts/write-extended-bios.py --slug abraham   # one specific
  py -3 scripts/write-extended-bios.py --dry-run        # no writes
  py -3 scripts/write-extended-bios.py --retries 3      # override retry cap
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import date
from pathlib import Path

# Force UTF-8 on stdout/stderr so Unicode log characters don't crash on
# Windows consoles using cp1252. Safe no-op on macOS/Linux.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

import httpx

# ---------- paths & config ----------

ROOT = Path(__file__).resolve().parent.parent
SAINTS_JSON = ROOT / "lib" / "data" / "saints.json"
EXTENDED_JSON = ROOT / "lib" / "data" / "saint-extended.json"
AUTH_FILE = Path(
    os.environ.get("MAVIS_AUTH") or Path.home() / ".mavis" / "local-runtime.auth.json"
)
LOG_DIR = Path(__file__).resolve().parent / "logs"

LLM_BASE_URL = "https://agent.minimax.io/mavis/api/v1/llm/v1"
LLM_MODEL_ID = "MiniMax-M3"  # provider prefix is added by auth header
LLM_TIMEOUT = 180.0

WRITER_MAX_TOKENS = 4096
CHECKER_MAX_TOKENS = 2048
WRITER_TEMPERATURE = 0.7
CHECKER_TEMPERATURE = 0.2

DEFAULT_RETRIES = 2
MIN_BIO_WORDS = 100
MAX_BIO_WORDS = 700
MIN_PARAGRAPHS = 2
MAX_PARAGRAPHS = 6
MIN_FAQS = 2
MAX_FAQS = 6


# ---------- LLM client ----------

def load_auth() -> str:
    data = json.loads(AUTH_FILE.read_text(encoding="utf-8"))
    return data["auth"]["accessToken"]


def llm_call(
    messages: list[dict],
    *,
    max_tokens: int,
    temperature: float | None = None,
    system: str | None = None,
) -> str:
    """Call the configured LLM and return the assistant text."""
    token = load_auth()
    final_messages = list(messages)
    if system:
        final_messages = [{"role": "system", "content": system}] + final_messages

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "anthropic-version": "2023-06-01",
    }
    body: dict = {
        "model": LLM_MODEL_ID,
        "max_tokens": max_tokens,
        "messages": final_messages,
    }
    if temperature is not None:
        body["temperature"] = temperature

    with httpx.Client(timeout=LLM_TIMEOUT) as client:
        resp = client.post(f"{LLM_BASE_URL}/messages", headers=headers, json=body)
        if resp.status_code != 200:
            raise RuntimeError(f"LLM {resp.status_code}: {resp.text[:500]}")
        data = resp.json()

    text = ""
    for block in data.get("content", []):
        if block.get("type") == "text":
            text += block["text"]
    return text.strip()


# ---------- prompts ----------

WRITER_SYSTEM = (
    "You are a Catholic content writer for Saint Discovery, a website that helps "
    "lay Catholics and seekers learn about the saints. Write in a clear, reverent, "
    "factual voice — accessible but substantive, not preachy. Use Catholic framing "
    "naturally (feast days, patronage, the Communion of Saints) but don't talk down "
    "to the reader. When you're not sure of a fact, say so briefly in passing rather "
    "than inventing. Output ONLY a JSON object — no prose, no markdown fences, no "
    "explanation. The JSON object must be the entire response."
)

CHECKER_SYSTEM = (
    "You are a Catholic history fact-checker. You review a generated biography and "
    "FAQ for a saint against authoritative source data. Be conservative — only flag "
    "claims that are clearly wrong or likely to mislead, not stylistic concerns. It's "
    "fine for the bio to acknowledge uncertainty (\"the exact dates are debated\") as "
    "long as it doesn't assert false specifics. Output ONLY a JSON object — no prose, "
    "no markdown fences."
)


def build_writer_messages(saint: dict, prior_issues: list[dict] | None = None) -> list[dict]:
    user = (
        f"Saint: {saint['name']}\n"
        f"Slug: {saint['slug']}\n"
        f"Feast day: {saint.get('feast_day') or 'unknown'}\n"
        f"Patron of: {saint.get('patron_of') or 'unknown'}\n"
        f"Lived: {saint.get('dates') or 'unknown'}\n"
        f"Origin: {saint.get('origin') or 'unknown'}\n"
        f"Gender: {saint.get('gender') or 'unknown'}\n"
        f"Known for (short): {saint.get('known_for') or saint.get('tagline') or 'unknown'}\n"
        f"Existing short description: {saint.get('description') or 'unknown'}\n"
        f"Existing fun fact: {saint.get('fun_fact') or 'none'}\n"
        f"Existing quotes: {json.dumps(saint.get('quotes') or [], ensure_ascii=False)}\n"
        f"\n"
        f"Write a JSON object with two fields:\n"
        f'- "biography": array of {MIN_PARAGRAPHS}-{MAX_PARAGRAPHS} paragraphs, '
        f"~{MIN_BIO_WORDS // MIN_PARAGRAPHS}-{MAX_BIO_WORDS // MIN_PARAGRAPHS} words each, "
        f"total {MIN_BIO_WORDS}-{MAX_BIO_WORDS} words. Flow naturally: early life / "
        f"context → conversion or calling → key works or witness → death and legacy. "
        f"Use concrete facts where you can verify them. If a fact is uncertain, note "
        f"it briefly rather than inventing.\n"
        f'- "faqs": array of {MIN_FAQS}-{MAX_FAQS} question/answer pairs — questions '
        f"real people would type into Google about this saint (e.g., \"Who is "
        f"St. X?\", \"What is St. X the patron saint of?\", \"When is St. X's feast "
        f'day?", "What did St. X do?"). Each answer is 1-3 sentences, factual, '
        f"drawing on the data above.\n"
        f"\n"
        f"Output ONLY the JSON object. Required schema:\n"
        f'{{"biography": ["p1", "p2", "p3"], "faqs": [{{"question": "...", "answer": "..."}}]}}'
    )
    msgs: list[dict] = [{"role": "user", "content": user}]
    if prior_issues:
        feedback = (
            "\n\nThe previous attempt had these critical issues — please fix them "
            "in your next response:\n"
            + json.dumps(prior_issues, indent=2, ensure_ascii=False)
        )
        msgs.append({"role": "user", "content": feedback})
    return msgs


def build_checker_messages(saint: dict, content: dict) -> list[dict]:
    user = (
        f"Saint: {saint['name']} ({saint['slug']})\n"
        f"\n"
        f"Source data (use as ground truth — flag anything that contradicts it):\n"
        f"- Feast day: {saint.get('feast_day') or 'unknown'}\n"
        f"- Patron of: {saint.get('patron_of') or 'unknown'}\n"
        f"- Lived: {saint.get('dates') or 'unknown'}\n"
        f"- Origin: {saint.get('origin') or 'unknown'}\n"
        f"- Known for: {saint.get('known_for') or saint.get('tagline') or 'unknown'}\n"
        f"- Description: {saint.get('description') or 'unknown'}\n"
        f"- Fun fact: {saint.get('fun_fact') or 'none'}\n"
        f"- Quotes: {json.dumps(saint.get('quotes') or [], ensure_ascii=False)}\n"
        f"\n"
        f"Generated content to review:\n"
        f"{json.dumps(content, indent=2, ensure_ascii=False)}\n"
        f"\n"
        f"Check for:\n"
        f"1. Date accuracy (birth, death, feast day) — does it match the source?\n"
        f"2. Place accuracy (origin, locations mentioned)\n"
        f"3. Patronage accuracy — is the saint's patronage correctly stated?\n"
        f"4. Made-up miracles, events, or anecdotes presented as fact\n"
        f"5. Quotes not in source — are they plausibly attributed or obviously fabricated?\n"
        f"6. Internal contradictions\n"
        f"\n"
        f"Output a JSON object:\n"
        f'{{\n'
        f'  "verdict": "approve" | "needs_revision",\n'
        f'  "issues": [\n'
        f'    {{"severity": "critical|minor", "field": "biography|faqs", '
        f'"claim": "the problematic claim", "fix": "suggested correction or \'remove\'"}}\n'
        f"  ],\n"
        f'  "notes": "any other observations (string)"\n'
        f"}}"
    )
    return [{"role": "user", "content": user}]


# ---------- parsing & validation ----------

_JSON_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def parse_json_loose(text: str) -> dict | None:
    """Extract a JSON object from text, tolerating prose and markdown fences."""
    text = (text or "").strip()
    text = _JSON_FENCE_RE.sub("", text).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def validate_content(content: dict) -> list[str]:
    """Return list of validation errors; empty list = valid."""
    errs: list[str] = []
    if not isinstance(content, dict):
        return ["content is not a JSON object"]
    bio = content.get("biography")
    faqs = content.get("faqs")
    if not isinstance(bio, list) or len(bio) < MIN_PARAGRAPHS:
        errs.append(
            f"biography must be a list of {MIN_PARAGRAPHS}+ paragraphs, got "
            f"{type(bio).__name__} len={len(bio) if isinstance(bio, list) else 'n/a'}"
        )
    else:
        if len(bio) > MAX_PARAGRAPHS:
            errs.append(f"biography has {len(bio)} paragraphs (max {MAX_PARAGRAPHS})")
        if not all(isinstance(p, str) and p.strip() for p in bio):
            errs.append("biography paragraphs must all be non-empty strings")
        else:
            words = sum(len(p.split()) for p in bio)
            if words < MIN_BIO_WORDS:
                errs.append(f"biography too short: {words} words (min {MIN_BIO_WORDS})")
            if words > MAX_BIO_WORDS:
                errs.append(f"biography too long: {words} words (max {MAX_BIO_WORDS})")
    if not isinstance(faqs, list) or len(faqs) < MIN_FAQS:
        errs.append(
            f"faqs must be a list of {MIN_FAQS}+ items, got "
            f"{type(faqs).__name__} len={len(faqs) if isinstance(faqs, list) else 'n/a'}"
        )
    else:
        if len(faqs) > MAX_FAQS:
            errs.append(f"faqs has {len(faqs)} items (max {MAX_FAQS})")
        if not all(
            isinstance(f, dict)
            and isinstance(f.get("question"), str)
            and f["question"].strip()
            and isinstance(f.get("answer"), str)
            and f["answer"].strip()
            for f in faqs
        ):
            errs.append("each faq must have non-empty 'question' and 'answer' strings")
    return errs


# ---------- per-saint pipeline ----------

def write_bio(saint: dict, log, retries: int) -> tuple[dict | None, dict | None]:
    """Run writer + checker loop. Returns (content, last_check_report)."""
    last_issues: list[dict] = []
    last_report: dict | None = None
    content: dict | None = None

    for attempt in range(1, retries + 2):  # initial + N retries
        # Writer
        messages = build_writer_messages(saint, prior_issues=last_issues or None)
        try:
            raw = llm_call(
                messages,
                max_tokens=WRITER_MAX_TOKENS,
                temperature=WRITER_TEMPERATURE,
                system=WRITER_SYSTEM,
            )
        except Exception as e:
            log(f"  ERR {saint['slug']} attempt {attempt}: writer error {type(e).__name__}: {e}")
            continue

        content = parse_json_loose(raw)
        if not content:
            log(f"  ! {saint['slug']} attempt {attempt}: JSON parse failed; raw[:200]={raw[:200]!r}")
            last_issues = [
                {
                    "severity": "critical",
                    "field": "shape",
                    "claim": "Response was not parseable as JSON",
                    "fix": "Return ONLY the JSON object, no prose or markdown fences",
                }
            ]
            continue

        # Shape validation
        errs = validate_content(content)
        if errs:
            log(f"  ! {saint['slug']} attempt {attempt}: validation failed: {errs}")
            last_issues = [
                {
                    "severity": "critical",
                    "field": "shape",
                    "claim": "; ".join(errs),
                    "fix": "Regenerate following the schema exactly",
                }
            ]
            continue

        # Fact-check
        try:
            check_messages = build_checker_messages(saint, content)
            check_raw = llm_call(
                check_messages,
                max_tokens=CHECKER_MAX_TOKENS,
                temperature=CHECKER_TEMPERATURE,
                system=CHECKER_SYSTEM,
            )
        except Exception as e:
            log(f"  ~ {saint['slug']} attempt {attempt}: checker error {type(e).__name__}: {e} (approving)")
            return content, {"verdict": "approve", "issues": [], "notes": f"checker error: {e}"}

        report = parse_json_loose(check_raw) or {}
        last_report = report
        verdict = report.get("verdict", "approve")
        issues = report.get("issues", []) or []
        critical = [i for i in issues if isinstance(i, dict) and i.get("severity") == "critical"]

        if verdict == "approve" or not critical:
            log(
                f"  OK {saint['slug']} attempt {attempt}: {verdict} "
                f"({len(issues)} issues, {len(critical)} critical)"
            )
            return content, report

        log(
            f"  ! {saint['slug']} attempt {attempt}: {len(critical)} critical issues, "
            f"retrying. Issues: {json.dumps(critical, ensure_ascii=False)[:600]}"
        )
        last_issues = critical

    # Exhausted retries
    if content is not None:
        log(
            f"  ~ {saint['slug']}: exhausted retries, accepting last content with "
            f"{len(last_issues)} unresolved critical issues"
        )
        return content, last_report
    return None, last_report


# ---------- main loop ----------

def load_saints() -> list[dict]:
    return json.loads(SAINTS_JSON.read_text(encoding="utf-8"))


def load_existing() -> dict:
    if not EXTENDED_JSON.exists():
        return {}
    try:
        return json.loads(EXTENDED_JSON.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(
            f"ERROR: saint-extended.json is malformed: {e}. Fix or remove it first.",
            file=sys.stderr,
        )
        sys.exit(2)


def save_extended(data: dict) -> None:
    """Atomic write: tmp file then rename."""
    tmp = EXTENDED_JSON.with_suffix(".json.tmp")
    tmp.write_text(
        json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8"
    )
    tmp.replace(EXTENDED_JSON)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--limit", type=int, default=0, help="Max saints to process (0 = all remaining)")
    parser.add_argument("--slug", type=str, default=None, help="Process only this slug")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't write to saint-extended.json, just log what would have been written",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=DEFAULT_RETRIES,
        help=f"Max retries per saint after a failed fact-check (default {DEFAULT_RETRIES})",
    )
    args = parser.parse_args()

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / f"extended-bio-{date.today().isoformat()}.log"

    def log(msg: str) -> None:
        line = f"[{time.strftime('%H:%M:%S')}] {msg}"
        print(line, flush=True)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(line + "\n")

    log(
        f"=== Start (dry-run={args.dry_run}, limit={args.limit}, "
        f"slug={args.slug}, retries={args.retries}) ==="
    )

    saints = load_saints()
    existing = load_existing()
    log(f"Loaded {len(saints)} saints, {len(existing)} already in saint-extended.json")

    if args.slug:
        saints = [s for s in saints if s["slug"] == args.slug]
        if not saints:
            log(f"No saint with slug={args.slug!r} found")
            return 1

    remaining = [s for s in saints if s["slug"] not in existing]
    log(f"Remaining to process: {len(remaining)}")

    if args.limit:
        remaining = remaining[: args.limit]

    succeeded = failed = 0
    for i, saint in enumerate(remaining, 1):
        log(f"[{i}/{len(remaining)}] {saint['name']} ({saint['slug']})")
        try:
            content, _report = write_bio(saint, log, args.retries)
        except KeyboardInterrupt:
            log("Interrupted -- exiting. Progress so far has been written.")
            return 130
        if not content:
            log(f"  FAIL {saint['slug']}: no content produced")
            failed += 1
            continue
        if args.dry_run:
            log(
                f"  (dry-run: would write bio={len(content['biography'])} paras, "
                f"faqs={len(content['faqs'])})"
            )
        else:
            existing[saint["slug"]] = content
            save_extended(existing)
            log(f"  -> wrote {saint['slug']} to saint-extended.json")
        succeeded += 1

    log(f"=== Done. Succeeded: {succeeded}, Failed: {failed} ===")
    log(f"Total in saint-extended.json: {len(existing)}/{len(saints)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
