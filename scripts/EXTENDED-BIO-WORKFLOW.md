# Extended Bio Workflow

Goal: fill `lib/data/saint-extended.json` with a long-form biography + FAQs
for every saint in `lib/data/saints.json`, so the saint pages don't fall
back to the short description.

## Files

- `lib/data/saint-extended.json` — output, keyed by slug
- `lib/data/saints.json` — input (486 saints)
- `scripts/write-extended-bios.py` — orchestrator (writer + fact-check loop)
- `scripts/extended-bio-status.py` — coverage + quality stats
- `scripts/logs/extended-bio-{YYYY-MM-DD}.log` — run log

## Schema (must match `app/saints/[slug]/page.tsx`)

```json
{
  "st-peter": {
    "biography": ["paragraph 1", "paragraph 2", "paragraph 3"],
    "faqs": [
      {"question": "Who is St. Peter?", "answer": "..."},
      {"question": "What is St. Peter the patron saint of?", "answer": "..."}
    ]
  }
}
```

Page falls back to the short `description` when no entry exists for a slug.

## Run

```bash
# Process every remaining saint (resumable — skips already-done)
py -3 scripts/write-extended-bios.py

# Just the next 10
py -3 scripts/write-extended-bios.py --limit 10

# One specific saint
py -3 scripts/write-extended-bios.py --slug abraham

# Dry run (no writes, no LLM call when possible)
py -3 scripts/write-extended-bios.py --dry-run --limit 5

# Allow 3 retries per saint instead of the default 2
py -3 scripts/write-extended-bios.py --retries 3
```

## Status

```bash
# Coverage + quality snapshot
py -3 scripts/extended-bio-status.py

# Include problem slugs
py -3 scripts/extended-bio-status.py --show-issues 30
```

## How it works

For each saint not yet in `saint-extended.json`:

1. **Writer** — sends a prompt with the saint's source data (name, feast day,
   patron, dates, origin, description, fun fact, quotes), asks for
   `{biography: string[], faqs: {question, answer}[]}` as JSON.
2. **Shape check** — parses JSON, validates the schema (≥2 paragraphs,
   100–700 words, ≥2 FAQs, non-empty strings).
3. **Fact-check** — second LLM pass compares the generated content against
   the source data and flags critical issues (wrong dates, places, patronage,
   made-up miracles, fabricated quotes).
4. **Retry** — if critical issues, writer gets up to N retries with the
   issues as feedback.
5. **Atomic write** — appends the slug to `saint-extended.json` via tmp file
   + rename, so a crash mid-write can't corrupt the file.
6. **Log** — every action is appended to today's log file.

## Resume behavior

Kill the script any time with `Ctrl-C`. The next run picks up at the first
slug that's still missing. Saint-extended.json is never partially written
because each saint is its own atomic write.

## Don't run twice

The script doesn't lock `saint-extended.json`. If you start two instances,
they'll race on writes and the last one to save wins per slug. One process
at a time. There's no PID file — just don't.

## Cost & timing

Roughly 5–8K tokens per saint (writer + checker, including retries).
486 saints × ~6K tokens = ~3M tokens. At ~30s/saint (network-bound) that's
~4 hours. Background it if you want to use the machine.

## When something goes wrong

1. Check `scripts/logs/extended-bio-{date}.log` for the failing slug.
2. Run that slug alone to see the issue:
   ```bash
   py -3 scripts/write-extended-bios.py --slug {failing-slug}
   ```
3. If the model can't produce a valid output for a saint (rare — usually
   source data is too thin), the script will mark it as failed but won't
   block other saints. Re-run later, or add the slug to a "skip" list in
   the script if it's never going to work.

## LLM config

The script reads auth from `~/.mavis/local-runtime.auth.json` (override
with `MAVIS_AUTH=/path/to/auth.json` env var) and calls
`https://agent.minimax.io/mavis/api/v1/llm/v1/messages` with the JWT in an
`Authorization: Bearer` header. Model is hardcoded to `MiniMax-M3` in the
script — change `LLM_MODEL_ID` at the top if needed.
