# Teacher and catechist resources

`/resources/teachers` provides free, ungated, ad-free classroom materials. The directory, Confirmation guide, and footer link to it; the main sitemap includes it. It includes a two-page student worksheet and a three-page, 45-minute lesson for middle/high school Confirmation groups, with younger learner and adult OCIA adaptations.

## Content and PDF updates

Edit `data/educator-resources.json`; it supplies both the online edition and the PDFs. Rebuild with `python scripts/build-educator-pdfs.py` (requires ReportLab and pypdf). The generator checks page counts and vertical overflow, writes local artifacts in `output/pdf`, and copies the two served PDFs to `public/downloads/educators`. Commit those served copies together with content changes. Render all five pages for a visual check after editing. US Letter, with fit-to-page printing for A4. PDFs are printable, not fillable; the HTML edition supports accessible reading and copying prompts into a classroom document.

The lesson cites the USCCB, Catechism 1302-1305 and 956-957, and Acts 1:8. Source links were checked September 23, 2026. It is supplemental material and does not replace parish/diocesan sacramental preparation. Original activity text is reusable with attribution; external source copyrights remain separate.

## Measurement

Each explicit PDF link click sends `educator_resource_click`, with `file_name`, `file_extension`, `link_url`, and the existing `link_placement` value `teacher_resources`. This records download **intent**, not a successfully saved/opened file or classroom completion. It contains no student responses or personal information and follows the existing production-only analytics helper. GA4 enhanced measurement may also emit `file_download`; do not sum the two event counts. File parameters on the custom event require custom dimensions if needed in Explorations; the event count and existing placement dimension can be used without adding those dimensions.

After deployment, inspect GA4 Realtime/DebugView for a real click, then compare resource-page users and download-click users over the same dates. Break out classroom.google.com referrals when sample sizes permit. The reported 146 Classroom sessions and 7m35s engagement motivated this resource; they do not establish a download baseline or prove an effect. The current release does not mark clicks as a conversion or claim improved engagement.
