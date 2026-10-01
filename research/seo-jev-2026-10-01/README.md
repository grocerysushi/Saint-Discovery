# Jev SEO review and improvements — October 1, 2026

Status: implemented and validated locally. This record covers the SEO audit and local verification; it does not confirm a production deployment. No database publication was performed for this SEO work.

## Coverage and evidence

The production crawl inspected all 554 unique URLs in the root and blog sitemaps: 460 biography pages, 36 patronage pages, 48 published articles, and 10 other public pages. Every URL returned HTTP 200. There were no unexpected noindex directives, duplicate titles or descriptions, broken links between sitemap pages, or missing internal anchor targets. This describes the current sitemap; it does not establish that Google has indexed each URL or resolve historical Search Console examples.

Jev evaluated 100 pages: all non-biography sitemap pages (including all 48 published articles), plus six representative biographies. The report uses the `jev-latest` model and records 496,567 input tokens and 17,300 output tokens. No Search Console query, ranking, traffic, or search-volume data was supplied or invented. The report distinguishes model judgment from HTML observations and does not equate a shared topic with duplicate search intent.

Local evidence files, intentionally ignored by Git:

- `output/seo-improvements/site-audit.json` and `site-summary.json`: whole-site production baseline.
- `output/jev-seo/2026-10-01T12-57-07.134Z/report.md` and `report.json`: 100-page Jev assessment.
- `output/seo-improvements/jev-revised-pages.json`: four-page review of the revised production HTML.
- `output/seo-improvements/preview-verification.json`: full local production verification.
- `output/seo-improvements/patronage-preview.png`: browser appearance of the Italy page.

## Implemented changes

1. Sharing metadata: complete page-specific Open Graph and Twitter cards replace partial objects on About, Privacy, the blog index, the patronage index, all 36 patronage pages, and Editorial Policy. This addresses 40 pages with missing sharing fields and the Editorial Policy sharing URL that incorrectly inherited the homepage URL. Existing public canonicals and intentional noindex pages remain intact.
2. Blog structured data: the index has CollectionPage/ItemList data for the actual rendered articles, including pagination and filter URLs. Filtered searches retain their existing noindex behavior. Publication dates are unchanged, and no invented modification dates were added to articles.
3. Crawlable discovery: relevant biography recommendations now render in the initial HTML. Existing visibility/click tracking and client refresh remain. Articles gain up to three relevant published next reads, excluding the current article, duplicates, malformed slugs and future publications. When the recommendation service is unavailable, the main biography or article remains usable.
4. Public content caching: reading summaries have a one-hour server cache rather than forcing every biography to regenerate every minute. The existing API refresh stays at one minute. Cache keys include the backend URL so an isolated preview/test does not reuse production summaries.
5. Content accuracy: the homepage reports the actual directory count, identifies entries rather than calling every entry a Catholic saint, and distinguishes the directory from the quiz pool. Its introduction and FAQs are contained in one main landmark. About has a unique description and accurately describes the directory's scope. Patronage introductions distinguish formal designation from local devotional association and do not promise an exhaustive list.
6. Source context: four patronage pages receive original explanatory notes with nearby verified sources, historical distinctions and useful next actions. Italy's note includes Catherine of Siena rather than suggesting Francis is the sole principal patron. Dunstan's tongs story is identified as a later legend.
7. Image loading: article covers have a reserved responsive 16:9 frame, including the broken-image fallback. Main covers and the featured index image load eagerly with high fetch priority; other blog images load lazily and decode asynchronously. Existing credits and alt text are preserved. Cards and Next.js fill images already had reserved layout containers; a missing width/height attribute alone was not treated as proof of layout shift.
8. Sitemap freshness: dates reflect the changed homepage, About content and patronage template. Biography review dates and patron-guide review dates are preserved rather than overwritten with build time.

## Source verification

- Benedict the African: [Franciscan Media's biography](https://www.franciscanmedia.org/saint-of-the-day/saint-benedict-the-african/) identifies the devotional patronage and his Franciscan service. The new note does not claim to document a papal designation.
- Dunstan: [the original Catholic Encyclopedia entry](https://www.newadvent.org/cathen/05199a.htm) documents medieval goldsmith-guild patronage and explicitly distinguishes the later tongs legend from his career.
- Italy: [Pius XII's June 18, 1939 brief](https://www.vatican.va/content/pius-xii/it/briefs/documents/hf_p-xii_brief_19390618_patroni-italia.html) is the original designation of Francis and Catherine as principal patrons.
- The Americas: [Ecclesia in America, section 11](https://www.vatican.va/content/john-paul-ii/en/apost_exhortations/documents/hf_jp-ii_exh_22011999_ecclesia-in-america.html) provides the continental context and the patroness invocation. Our Lady of Guadalupe is explained as a title of Mary.

The four revised pages' Jev source-support scores increased from approximately 0.20–0.29 to 2.25–2.66 on its 0–4 rubric. Follow-up confidence was only 0.27–0.49, below the workflow's 0.75 threshold: these remain uncertain model assessments, not certification of theology or factual accuracy. The original sources were independently read before the notes were written. This comparison does not demonstrate a ranking or traffic gain.

## Validation

- 108 unit tests passed, including source handling, recommendations, structured data, canonicals, quiz behavior, email behavior and analytics privacy.
- Production build and TypeScript compilation passed.
- Six production SEO checks passed, covering every biography, citations, redirects, intentional exclusions, sitemap discovery, new sharing cards and sourced patronage notes.
- The isolated production blog HTTP test passed for rendering, pagination, metadata, related links, feeds, private-draft exclusion and backend failure handling. It queries only the published view and does not write to InsForge.
- All 554 sitemap routes were rechecked against the local production preview: zero technical/sharing failures, zero duplicate titles or descriptions, and zero broken additional biography/article links. All 48 article covers had their reserved frame.
- Browser check: the Examen article rendered its real published body and related reading, with a 1000 × 562.5 cover frame (16:9), eager/high-priority cover loading and no horizontal overflow at the inspected desktop viewport.
- Modified application and audit files passed ESLint; Git diff whitespace checks passed.

The initial development preview had an unavailable blog connection. Validation used the separately started production preview at `http://127.0.0.1:3130`, where public content loaded successfully. A fixture check also exposed summaries crossing preview environments; cache keys were corrected and the test rerun successfully.

## Remaining measurement

After deployment, rerun `npm run seo:site` and compare the live crawl with this record. Search Console URL inspections, indexing, query impressions/clicks and field Core Web Vitals require follow-up data. The changes improve observable content and technical behavior; they do not establish Google indexing, AdSense approval, mobile field performance, backlink growth, or a traffic increase. Jev was used as triage, not as an automatic bulk rewriter.

Repeatable workflow: `scripts/JEV-SEO.md`. The API key stays in ignored `.env.jev.local`, is never sent with page content, and is not shipped to visitors.
