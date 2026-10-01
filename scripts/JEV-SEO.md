# Jev SEO workflow for Saint Discovery

This local, read-only workflow connects public Saint Discovery pages to TypeSafe's Jev API. It creates a prioritized Markdown report and a JSON record with HTML findings, scored dimensions, confidence, potential overlap and internal-link opportunities. It never edits, publishes, deletes, or changes indexing for a page.

## Setup

Requires Node 22.18 or newer and the project's installed dev dependencies (`npm ci`). Save your key locally in `.env.jev.local`:

```
TYPESAFE_API_KEY=your_private_key
TYPESAFE_MODEL=jev-latest
```

This file is ignored by Git. Environment variables override these settings. The key goes only to `https://api.typesafe.ai` and is never included in page state, output reports, npm commands, browser code or Next.js public environment variables. There is no visitor-facing script and no Vercel deployment needed for this workflow.

## Run

```
npm run seo:jev -- --check
npm run seo:jev -- --dry-run
npm run seo:jev
npm run seo:jev -- --url /blog/why-st-therese-patron-saint-missions --url /saints/therese-of-lisieux
npm run seo:jev -- --sitemap --limit 25
npm run seo:site
node scripts/jev-site-review.mjs
```

The default pilot fetches at most six pages spanning the homepage, blog index, Confirmation guide, Saint of the Day, Thérèse biography and a blog article. `--sitemap` expands discovery, subject to `--limit` (1–100). Explicit `--url` values let you choose the next batch. Reports are saved under ignored `output/jev-seo/<timestamp>/`. Completed evaluations are saved immediately so a later API failure does not lose the useful results. `--check` verifies authentication/model access without paying for content evaluations. `--dry-run` performs HTTP/HTML checks without calling TypeSafe.

## How to read the report

`seo:site` checks up to 1,000 URLs from both production sitemaps without calling Jev. It records sharing metadata, HTML links, anchors and image review flags under `output/seo-improvements/`. Missing image dimensions are review prompts, not proof of layout shift: Next.js fill images and CSS aspect-ratio containers may already reserve space. `jev-site-review.mjs` uses that crawl to select all non-biography sitemap pages plus representative biographies, capped at 100 paid evaluations. Run the technical crawl first. It does not schedule recurring calls.

After building local revisions into `.next-jev-seo`, `node scripts/jev-preview-review.mjs` submits only the four patronage pages revised in the October 1 review. Its output identifies the content as local production HTML, not a live deployment. The API key stays in the ignored local environment file. This adds four paid evaluations; it does not crawl the entire build.

Technical findings are observed HTTP/HTML evidence: title, search description, canonical, H1, robots directives, article structured data, and duplicate metadata within the selected sample. A noindex or alternate canonical can be intentional; confirm before changing it. Word counts are descriptive and are not a quality cutoff. Noindex pages are not sent to Jev.

Jev separately scores title alignment, opening clarity, useful depth for the page's purpose, and visible source support on a 0–4 rubric. Confidence below 0.75 goes to human review. A confident low score produces a review action; it is not proof that a page is bad. Potential overlap and next-read suggestions compare up to three fetched candidates, selected by lexical similarity, using their titles, descriptions and openings. They cannot establish duplication or competing Google rankings across the whole site. Yes-probabilities are preserved and are not mislabeled as the separate confidence field returned for scores.

The quiz and directories are judged as tools/navigation rather than articles. The HTML extraction excludes scripts and shared navigation and limits long content samples to 18,000 characters, with an explicit truncation finding. Public routes only: no admin, API, subscription/account or individual-result routes; no query-string URLs or off-site redirects. robots.txt is respected. This is an HTML audit, not a browser interaction, accessibility, performance, or complete Google indexing test.

No Search Console queries, traffic or ranking data are invented. Jev does not certify theology, verify citations against their sources, guarantee rankings, or decide AdSense eligibility. Use the report to choose edits, then research claims and review actual reader needs. TypeSafe charges evaluations against the account; the limit bounds requests, reported token usage is saved, and failed POSTs are not automatically retried.

Official API and question schema: https://docs.typesafe.ai/api

Model discovery: https://api.typesafe.ai/docs

Question design: https://docs.typesafe.ai/introduction
