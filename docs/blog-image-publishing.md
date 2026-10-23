# Images in future daily posts

The approved public InsForge `blog-images` bucket stores only reviewed public artwork. New daily covers are optimized locally once, uploaded as content-addressed WebP files, and served directly from storage. Vercel performs no image transformations and a new article does not need a Git deployment. Only the linked CLI uses credentials; these scripts never read or print keys and never create buckets or change permissions.

## Required daily sequence

1. Finish rights/credit/alt-text review. Save the actual reviewed source artwork locally and retain its original source URL and complete attribution in `metadata.json`.
2. From the linked `Saint-Discovery-review` project run:

   `node scripts/optimize-blog-cover.mjs research/blog-daily/YYYY-MM-DD-0500/metadata.json research/blog-daily/YYYY-MM-DD-0500/cover-original.jpg research/blog-daily/YYYY-MM-DD-0500/images --upload`

3. Inspect all resulting images for quality, full artwork, accurate alt text and attribution. Each file is at most 300,000 bytes, with widths 384/768/1280 capped to the source. No cropping or enlargement. Optimization failure stops publication; do not silently fall back to a large source URL.
4. In that day's `prepare.mjs`, read `images/metadata.optimized.json` for the content metadata. Preserve the original `metadata.json` and rights notes. Include the optimized metadata and receipt hashes in the separate editorial review. Both draft and published payloads must use the optimized cover and its unchanged source credit plus the resizing note.
5. Keep the existing date/time, one-post limit, conflict checks, immediate database recheck, editorial review hashes, link checks and atomic SQL insertion. Publish with `node scripts/publish-optimized-blog.mjs research/blog-daily/YYYY-MM-DD-0500`, rather than invoking the per-day publisher directly. This wrapper verifies the remote images again, the metadata hash, credits, the draft/published cover, and the actual SQL payload, before invoking the existing guarded publisher.
6. Verify the live article and journal use the uploaded cover's responsive siblings, not `/_next/image`. Preserve the full artwork and credits. Save sizes, keys, URLs, hashes, visual review and checks in the day's record.

The wrapper rejects unrelated inline images until they have a separate reviewed optimization gate. Existing daily articles use text/link bodies. Do not remove an inline image merely to satisfy the gate: prepare its variants and extend validation before publishing it.

## Recovery and social posts

An existing content-addressed file is verified and reused, not overwritten. A failed upload records a blocker; reconcile unknown outcomes and rerun preparation without creating another article. Keep the original artwork locally. Receipts retain both returned storage keys and URLs, hashes, dimensions and the original source/credit. Original files are not automatically uploaded.

The optimized cover remains the same artwork. Daily social posts must use that actual published cover, retaining the original artist/source/license attribution from the receipt and metadata. Storage ownership is not authorship or a license. Existing carousel/Story/Pin formats and tracking requirements remain unchanged.

## Manual editor images

The editor automatically optimizes uploaded files and supported URL imports before inserting either a cover or an inline image. Pasted/dropped images open the same dialog so the author can supply alt text and attribution. The dialog accepts files up to 4 MB. URL imports support Wikimedia Commons, The Met and existing public site artwork; other hosts require downloading then uploading the file. All redirects are checked against the same host/path allowlist; the server never fetches arbitrary internal or credential-bearing URLs. Downloads are bounded to 10 MB and decoded images to 40 million pixels; animation is rejected.

`POST /api/blog/admin/images` requires same-origin access and the existing blog-editor session before reading or processing input. It uses that user's SDK client and the existing storage ownership policies; no admin key or new permissions are required. The shared processing module produces the same variants and content-addressed names as the daily workflow. Existing identical objects are verified and reused. Every new variant is read back and hash-checked before an insertable URL is returned. A public receipt stores variant keys/URLs, dimensions and hashes; it contains no credentials, filename or draft text. Uploaded originals remain with the author; downloaded source originals are not republished automatically.

Alt text and credit are required for new manual images. Cover credits use the existing field; inline credits persist in Tiptap image attributes and render as a caption. Only successful processing changes the draft. Errors and cancellation leave existing content in place; failed partial uploads can be safely reused on retry. Legacy posts are not bulk rewritten and remain editable. Vercel performs one bounded processing operation per newly inserted image, not an image transformation per reader/width; reading uses the storage URL directly. Vercel runtime image optimization remains disabled globally. Direct image requests use InsForge bandwidth/storage, and ordinary site traffic still counts toward Vercel CDN usage.
