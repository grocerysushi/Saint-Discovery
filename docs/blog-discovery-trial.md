# Blog discovery trial

## Change

The quiz result shows two relevant articles after its primary biography invitation. Saint biographies show the same section after the biography text. Both include Browse all articles. Shared quiz-result landing pages are unchanged; the personalized result is the first trial placement. No ad scripts or placements are added outside the blog.

Recommendations prioritize a saint's name or an explicit editorial connection, then topics in the saint's public description, known-for and patronage fields. Fallbacks are published guides about intercession, feast days and Confirmation reports. Topic matches are reading suggestions, not claims that the article is a biography. Ranking never reads a visitor's answers or scores.

Only the anonymous `blog_published_posts` projection is queried. The shared catalog contains title, excerpt, category, slug and publication date for the latest 200 posts, cached for 60 seconds. It never requests draft contents, full bodies, image data or admin credentials. Unknown saints, unresolved identities, future dates and invalid slugs are excluded. Publication changes may take a short cache interval to appear. Revisit the bounded catalog as the blog grows past 200 posts.

The parent pages remain independent of the blog backend. Recommendations load in the browser with a timeout. An empty catalog, outage or disabled JavaScript leaves the normal blog link available; it does not block the quiz or biography. This is an internal-discovery feature, not a replacement for the existing blog sitemap or server-rendered article pages.

## Measure after deployment

The reported 7,207 homepage views and seven active users on the blog index use different metrics and cannot be divided into a conversion rate. Direct article arrivals also bypass the index. The new blog's search performance needs more time and separate Search Console review.

This first rollout is an observational trial, not a randomized A/B experiment. Version `v1` identifies its ranking and layout.

1. In GA4 Explore, create a funnel with `article_recommendation_view` followed by `article_recommendation_click`, filtered to `recommendation_version = v1`. Break down by **Biography link placement** (`result_blog` or `biography_blog`), then **Recommended article** where useful. Use matched users in the funnel; repeated clicks divided by raw view counts are not a user conversion rate.
2. Review `blog_discovery_click` separately for visits through the blog index. Compare total users and engaged sessions on **all `/blog/` article paths**, not just `/blog`.
3. Check article engagement after the click and watch `biography_click` and confirmed subscriptions as guardrails. Increased blog browsing should not obscure the primary biography and email actions.
4. Review once there are enough observed card exposures in each placement. A 2–4 week review is a starting point, not a significance guarantee. Change one placement or ranking choice at a time and increment the version. Traffic mix and seasonality limit before/after conclusions.

An impression requires 50% card visibility and is deduplicated for that mounted card. Remounts and repeat visits can produce additional impressions. No dwell-time requirement is imposed. Browsers without IntersectionObserver do not emit impressions; analytics blocking can undercount. Live reporting dimensions are configured, but website events begin only after deployment. Localhost checks do not populate production GA4.

## Validation

- 61 tests passed; targeted ESLint, TypeScript and the production build passed (546 pages).
- Live public-catalog checks confirmed Padre Pio → confession, Faustina → Divine Mercy, Matthew → his calling, and James the Greater → the Camino. A fifth saint exercised thematic recommendations.
- Browser checks verified biography cards, opening the published Padre Pio article, and the recommendation section after a complete quiz.
- Failure/empty states, visibility deduplication, click parameters and requests finishing after unmount were tested with mocks. Drafts and bodies are absent from the endpoint response.
