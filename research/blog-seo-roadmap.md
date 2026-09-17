# Saint Discovery blog: search and editorial plan

## Implemented foundation

- Published article text and browsing links render on the server.
- Article title and excerpt become unique search metadata; the editor shows a search preview. If the excerpt is empty, a short plain-text summary is derived from the body.
- Canonical URLs use the public domain, not localhost or a preview deployment.
- BlogPosting and breadcrumb structured data describe the actual author, article, and publication date. Draft edit timestamps are not misrepresented as publication updates.
- Public browsing is paginated at 12 posts, with ordinary links to older pages. Category and search results are noindex/follow and have their own canonical URLs.
- Drafts, trashed posts, and unpublished posts are excluded by the database's public view. Unknown article URLs return 404. Admin pages remain noindex.
- `/blog/sitemap.xml` lists all public articles in bounded database batches. It is advertised in robots.txt. `/blog/feed.xml` supplies the latest 50 articles.
- The empty blog is noindex and excluded from the blog sitemap until it has a publication.
- Post saves invalidate the blog layout cache, preventing an unpublished story from lingering in the application cache. Article pages otherwise revalidate every five minutes.
- Public listing queries omit full article bodies; individual articles fetch their full published snapshot only.

## Editorial direction

The blog should answer questions that lead readers naturally into existing biographies and guides. Do not duplicate a biography's primary search intent with a second generic life story.

Possible clusters to validate against Search Console queries (these are editorial ideas, not verified keyword volumes):

1. **Choosing a Confirmation saint:** how to compare candidates, questions to discuss with a sponsor, and how to learn from a saint after Confirmation. Link to the main Confirmation guide and a few specific biographies.
2. **Saints in everyday life:** applying a documented episode from a saint's life to study, parenting, work, or service. Link to the appropriate patron-saint guide and primary biography.
3. **Feast days at home:** simple, researched ways to learn and reflect as a family. Distinguish local feast calendars and traditions when relevant. Link to Saint of the Day and the saint's biography.
4. **Catholic questions about saints:** explain one concrete question clearly, cite authoritative Catholic sources, and distinguish documented history, Church teaching, and devotional tradition.

Before choosing a title, check Search Console for relevant queries already receiving impressions, especially where readers' intent is only partly answered. Group variations of the same question into one strong article. Existing guides should remain the main page for their current topics.

## A repeatable post brief

- Reader and question: who needs this answer, and what will they leave knowing?
- Distinct value: an original explanation, practical resource, sourced comparison, or personal experience clearly identified as such.
- Opening: answer the main question early, then explain it.
- Structure: descriptive headings and only as much length as the question requires.
- Sources: cite sources beside factual claims; prefer primary Church, diocesan, religious-order, or historical sources as appropriate.
- Author: use the real writer's name or honestly attribute the piece to Saint Discovery. Do not imply clergy review or credentials unless they exist.
- Links: include relevant biographies/guides and related posts where useful, with descriptive link text.
- Images: use images with publication rights, accurate alt text, and credits. Prefer durable optimized image URLs over inline base64 uploads for public publishing.
- Final review: check factual accuracy, links, excerpt, title, slug, mobile reading, and ad placement. Keep the URL stable after publication.

A suggested starting cadence is one or two thoroughly reviewed posts per week, adjusted to the available writing and fact-checking time. Quality and topical fit determine the cadence; there is no required article length or posting frequency for ranking.

## Measure after deployment

Submit the blog sitemap in Search Console and inspect the first real published URLs. Confirm the rendered text, canonical, indexing eligibility, and structured data. Track clicks, impressions, CTR, and queries per article/cluster over time. Track useful onward actions, such as visits to biographies, guides, or the quiz. Review pages that get impressions but few clicks, and improve the match between the title, opening answer, and search intent. Avoid repeatedly changing URLs.

Next editorial/product work: author profile pages, publication-specific modification dates, redirects for changed slugs, related articles based on topic, durable media storage, and editorial/source-review fields. Ads remain confined to the blog and should not obscure the article or shift the reading layout.

Technical changes do not guarantee a particular ranking or traffic total. They make useful published content accessible and understandable to search engines.

References:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/structured-data/article
- https://nextjs.org/docs/app/api-reference/functions/revalidatePath
