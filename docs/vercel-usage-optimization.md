# Vercel usage reductions

## Static pages and freshness

The homepage, saint biographies and patronage guides use `revalidate = false`: repository content changes on deployment, rather than regenerating hourly/daily. Biography recommendations use the public build-time catalog in `lib/data/blog-artwork-catalog.json` for useful HTML links, then retain the existing client refresh and view/click events. Saint share-image handlers are explicitly static and do not expire periodically.

The homepage starts with a neutral daily-reflection card and resolves the visitor's local date through the existing client refresh; it never presents a build-date saint as today's. The interactive quiz remains client-side. Filtered directory/journal pages, admin and email operations still have server functionality.

Blog articles retain their five-minute ISR interval and existing authenticated editor invalidation. Direct database publishing therefore retains its established freshness behavior. Successful RSS/sitemap responses get four minutes of shared CDN caching; errors remain uncached. Explicit-date saint API responses get one hour of shared caching; implicit today gets only one minute. Recommendation responses/catalog get four minutes. No private/admin/email response gained public caching.

Navigation, journal cards and recommendation links disable speculative prefetching, so merely seeing a link does not fetch the destination route. Links remain normal crawlable anchors and retain client navigation on click.

## Responsive artwork

`components/StaticImage.tsx` serves content-hashed WebP variants directly with native `srcset`, intrinsic dimensions and the existing `sizes`, alt text, loading priority and framing. Widths are 384, 768 and 1280 pixels, capped at the source width. Source proportions are preserved; no artwork is cropped. Hashes include source bytes and encoder settings. `/images/responsive/` uses a one-year immutable browser/CDN cache. Original assets and all source/artist/license metadata are retained.

Global Next image optimization is disabled so icons and new/unprepared artwork cannot trigger metered transformations. If a prepared variant fails, the renderer retries its original source before the existing symbolic/unavailable treatment. New images not yet in the manifest render directly until prepared; they do not silently disappear or require a deployment to publish a blog article. New large covers should be supplied already compressed (ideally a verified 960–1280px source) until their variants are deployed.

Run `npm run images:prepare -- --refresh-blog` before deploying new image content. This refreshes public blog metadata, prepares all assigned saint artwork and current covers, and writes the catalog and manifest. It reuses identical bundled Commons artwork and downloaded `.cache/artwork-sources/` originals. Remote Commons images use the official thumbnail redirect service. Commit `lib/data/{blog-artwork-catalog,responsive-images}.json` and new `public/images/responsive/` assets with the code. No credentials or private blog drafts are read. A failed download reports its URL and retains existing valid variants. The build itself has no network dependency on Wikimedia.

## Verification and limits

`tests/static-images.test.mjs` checks coverage of every saint/catalogued cover, actual image dimensions, no cropping/upscaling, responsive markup and variant-to-source fallback. `tests/static-pages-build.test.mjs` checks the production prerender manifest and built biography output. Existing artwork, email, recommendation and local-date tests remain applicable.

These changes reduce future transformation work and scheduled regeneration; they do not erase accumulated usage or reset a Vercel quota. Static delivery still counts toward CDN requests. Bundled variants consume deployment storage; old deployments were not deleted. No hosting plan, billing, authentication, database policy or domain was changed.
