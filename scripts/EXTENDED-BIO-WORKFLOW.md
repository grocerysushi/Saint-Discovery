# Biography workflow: external source review

The former model-only extended-biography workflow is deprecated. Do not run `write-extended-bios.py` to populate or verify production biographies. Its second model pass compared generated prose with already unreliable input; that is not independent historical verification. Legacy `saints.json` and `saint-extended.json` contain unsupported claims and are not factual authorities.

## Current records

- `lib/data/saints.json` supplies the legacy slug inventory.
- `lib/data/saint-reviews*.json` supplies externally source-compared review overlays, keyed by slug.
- `research/BIOGRAPHY-REVIEW.md` documents coverage, unresolved identities, aliases, and limitations.
- `scripts/audit-biographies.mjs` validates coverage and structural consistency.

Each slug belongs in exactly one review file. Use `source-reviewed` for a completed comparison, `duplicate` for an alias pointing directly to a source-reviewed canonical slug, and `needs-identification` when the identity cannot responsibly be established. Unresolved records are not confirmed saints.

## Review process

1. Identify the person or observance using external sources. Prefer the Holy See, dioceses, religious orders, church calendars, and historical reference works, recognizing their limitations.
2. Compare identity, name, saint/blessed status, feast and local-calendar variants, dates, origin, and retained patronages.
3. Write original, substantive biography paragraphs with qualifications for legends, sparse evidence, or private revelation. Cite actual source pages with titles and HTTPS URLs.
4. Remove unsupported quotations, attributed prayers, fun facts, and patronages. Do not infer them from legacy data.
5. Label the method as AI-assisted comparison with cited external sources, not ecclesiastical approval. Keep unresolved claims visibly uncertain.
6. Run the audit and regenerate the report.

```sh
node scripts/audit-biographies.mjs
node scripts/audit-biographies.mjs --require-complete --write-report
```

The normal audit prints pending records; `--require-complete` makes pending coverage a failure. Structural errors always fail. The audit checks source URL shape, not page availability or historical truth. Source verification remains an editorial responsibility.

The former generator and extended-bio status utility may remain as historical files, but their output or coverage counts must not be treated as source verification. This workflow requires no generator credentials or model-service configuration.
