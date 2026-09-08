# Search visibility

The canonical production origin is https://www.saintdiscoveryquiz.com. If
`NEXT_PUBLIC_SITE_URL` is configured, set it to that exact origin. Deployment
hostnames must not replace the public domain in canonical tags or the sitemap.

## After deployment

1. Verify the domain in Google Search Console. DNS verification is preferred;
   the site also supports a URL-prefix property's HTML verification token via
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (rebuild after setting it).
2. Submit https://www.saintdiscoveryquiz.com/sitemap.xml in Search Console.
3. Inspect the homepage, directory, and a few saint biographies with URL
   Inspection. Confirm the Google-selected canonical is the public www URL.
   Request indexing for those changed pages; submitting the sitemap covers the
   full directory without requesting each page individually.
4. Check the rendered article and breadcrumb markup with Google's Rich Results
   Test. Markup helps describe content; it does not guarantee a rich result.
5. Track impressions, clicks, queries, indexing exclusions, and Core Web Vitals
   in Search Console. Compare over several weeks, not immediately after release.

No Search Console property was connected or sitemap submitted by this code change.
Google chooses when to crawl, index, and rank pages; first place is not guaranteed.

## Editorial priorities

Technical SEO cannot replace accurate, useful biographies. Audit the existing
catalog before adding more entries: it contains feast observances, groups,
blesseds, and individual saints. Verify names, canonical status, feast calendars,
patronages, quotations, and image identities against primary or reputable Catholic
sources. Cite the specific sources actually used to review each biography. Do not
infer biography citations from an image's Wikimedia article link.

Prioritize biographies using actual Search Console queries. Add researched details
that answer readers' questions, with a visible reviewer/byline and review date only
after review has occurred. Do not invent authors, historical facts, reviews, or
publication dates to fill structured data. Avoid mass-produced near-duplicate pages
and keyword stuffing. Seek legitimate links from relevant parishes and Catholic
organizations through useful content and relationships.

## Maintenance and verification

`npm run test:seo` checks rendered production-build HTML for all saint pages,
canonical URLs, descriptions, structured data, crawlable directory links, and
sitemap coverage. Run `npm run build` first. `npm test` covers data/helper behavior.
Sitemap dates are deliberately stable: update lastmod only when the corresponding
page content, links, or structured data changes meaningfully.

References: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
