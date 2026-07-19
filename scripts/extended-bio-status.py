#!/usr/bin/env python3
"""
Quick status check for saint-extended.json coverage.

Reports total/remaining saints, next-up queue, quality stats on what exists,
and any saints that look malformed in the existing file.

Usage:
  py -3 scripts/extended-bio-status.py
  py -3 scripts/extended-bio-status.py --show-issues 20   # also list first 20 problem slugs
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SAINTS_JSON = ROOT / "lib" / "data" / "saints.json"
EXTENDED_JSON = ROOT / "lib" / "data" / "saints.json"  # placeholder; real path below
EXTENDED_JSON = ROOT / "lib" / "data" / "saint-extended.json"


def main() -> int:
    if not SAINTS_JSON.exists():
        print(f"ERROR: {SAINTS_JSON} not found", file=sys.stderr)
        return 1

    saints = json.loads(SAINTS_JSON.read_text(encoding="utf-8"))

    extended: dict = {}
    if EXTENDED_JSON.exists():
        try:
            extended = json.loads(EXTENDED_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"ERROR: saint-extended.json is malformed: {e}", file=sys.stderr)
            return 1

    show_issues = "--show-issues" in sys.argv
    n_show = 20
    for i, arg in enumerate(sys.argv):
        if arg == "--show-issues" and i + 1 < len(sys.argv):
            try:
                n_show = int(sys.argv[i + 1])
            except ValueError:
                pass

    total = len(saints)
    done = len(extended)
    pct = (done / total * 100) if total else 0
    print(f"Saints:              {total}")
    print(f"Extended bios done:  {done}  ({pct:.1f}%)")
    print(f"Remaining:           {total - done}")
    print()

    done_slugs = set(extended.keys())
    missing = [s for s in saints if s["slug"] not in done_slugs]
    print(f"Next 10 to do:")
    for s in missing[:10]:
        print(f"  - {s['slug']:<35} {s['name']}")
    if len(missing) > 10:
        print(f"  ... and {len(missing) - 10} more")
    print()

    if not extended:
        return 0

    para_counts = [len(c.get("biography", [])) for c in extended.values()]
    faq_counts = [len(c.get("faqs", [])) for c in extended.values()]
    word_counts = [
        sum(len(p.split()) for p in c.get("biography", []) if isinstance(p, str))
        for c in extended.values()
    ]
    print(f"Avg paragraphs/saint:  {sum(para_counts)/len(para_counts):.1f}")
    print(f"Avg FAQs/saint:        {sum(faq_counts)/len(faq_counts):.1f}")
    print(f"Avg biography words:   {sum(word_counts)/len(word_counts):.0f}")
    print(f"Min biography words:   {min(word_counts)}")
    print(f"Max biography words:   {max(word_counts)}")
    print()

    # Quality issues
    issues: list[tuple[str, str]] = []
    for slug, c in extended.items():
        if not isinstance(c, dict):
            issues.append((slug, "entry is not an object"))
            continue
        bio = c.get("biography")
        faqs = c.get("faqs")
        if not isinstance(bio, list) or len(bio) < 1:
            issues.append((slug, "missing biography"))
        if not isinstance(faqs, list) or len(faqs) < 1:
            issues.append((slug, "missing faqs"))
        if isinstance(bio, list):
            for j, p in enumerate(bio):
                if not isinstance(p, str) or not p.strip():
                    issues.append((slug, f"biography[{j}] is empty/non-string"))
        if isinstance(faqs, list):
            for j, f in enumerate(faqs):
                if not isinstance(f, dict) or not f.get("question") or not f.get("answer"):
                    issues.append((slug, f"faqs[{j}] missing question/answer"))

    if issues:
        print(f"Quality issues found:  {len(issues)}")
        if show_issues:
            for slug, msg in issues[:n_show]:
                print(f"  - {slug}: {msg}")
            if len(issues) > n_show:
                print(f"  ... and {len(issues) - n_show} more")
    else:
        print("Quality issues found:  0")

    return 0


if __name__ == "__main__":
    sys.exit(main())
