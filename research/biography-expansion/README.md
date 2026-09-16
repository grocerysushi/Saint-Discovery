# Published biography expansion

Four parallel editorial batches cover all 460 published canonical profiles. The 486 legacy slugs also contain 16 duplicate redirects and 10 unresolved identities; those records are not turned into additional saint biographies.

Each `lib/data/saint-biography-expansions-N.json` entry contains expanded original prose, source references, a review date, and a method note. `lib/saint-reviews.ts` overlays only these editorial fields on the existing researched records. Names, saint/blessed/Orthodox distinctions, calendar qualifications, quiz traits, and duplicate handling remain in their established sources.

All profiles have at least four paragraphs and gain at least 50 words over their reviewed baseline. Total biography text increased from 48,156 to 93,148 words (about 93%). Profiles range from 169 to 367 words; twenty-nine well-documented profiles have longer treatments of 300 or more words. Length remains proportional to available evidence: an early martyr with sparse records should not acquire invented events to match a modern founder's biography.

The numbered notes describe consultation methods, access limitations, and source trails. This is AI-assisted source-based editing, not approval by a church authority or a substitute for specialist historical review.

Validation:

```sh
node scripts/audit-biographies.mjs --require-complete --write-report
npm test
npm run lint
npm run build
npm run test:seo
```

The build checks additionally confirm that every paragraph and cited source is present in the generated public saint pages. Use the same `SAINT_BUILD_DIR` for the build and SEO checks when building into an isolated output directory.
