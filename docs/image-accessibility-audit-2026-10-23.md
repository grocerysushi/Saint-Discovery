# Image accessibility audit — October 23, 2026

## Coverage

- All 825 published canonical saint records and their shared rendering in biographies, daily features, quiz results and the directory.
- Visual review of all 547 assigned historical photographs, paintings, icons, sculptures and contextual images, using local source-image contact sheets. Replaced generic descriptions with the visible medium, subject and distinguishing details. Sources, credits, licenses and image URLs remain unchanged.
- All 278 generated-art records retain explicit AI disclosure, now using the reviewed display name and clarifying that the likeness is imagined rather than a historical portrait.
- All 96 published blog pages fetched from the live blog sitemap: 96 image elements; none missing alt text. Their existing cover descriptions identify the actual artwork. No inline images on these published pages required content corrections.
- All first-party image/SVG renderers, decorative CSS imagery, social links, generated share cards, and both rendered result/confirmation email templates. Result emails contain four social icons; confirmation emails contain no images.

## Changes

- Historical saint artwork now describes what is visible rather than saying “Image associated with …”. Maps, churches, coins, group scenes and shrines are described as those things, not portraits.
- The Zélie Martin record currently uses a photograph of Louis Martin. Its alternative now explicitly identifies Louis and says it is not a portrait of Zélie; no unverified replacement artwork was introduced.
- Directory thumbnails are decorative because the same link contains the saint's name and summary. Full artwork descriptions remain on the biographies. Visible artwork licensing links remain intact; the identical alt sentence is no longer repeated in the figure caption.
- Website social icons remain decorative inside explicitly named links. Email icons carry full destination/action alternatives because email clients may remove ARIA attributes. Discord's 18+ requirement remains in the label.
- A failed informative blog image announces “Image unavailable” with its description. A failed decorative image stays hidden from assistive technology.
- Blog publication validation now rejects missing/null inline-image alternatives while preserving deliberately empty alternatives for decorative images. The editor already asks for descriptive alt text on image insertion and covers.

## Regression checks

Saint-artwork coverage tests check every published record for non-generic alternatives, honest generated-art labels and valid local media. Email rendering tests verify all four destinations still have meaningful names after ARIA removal. Blog tests cover nested missing alternatives, null alternatives, descriptions and explicit decorative alternatives.

Production build passed (905 generated pages). A separate HTML test checks the rendered image alternatives on all 825 biographies. The older broad `seo-build` suite has unrelated stale expectations: it expects a static `resources.html` despite server pagination, and its source-list assertion omits existing additional biography citations. Those unrelated assertions were not changed in this image audit.

The audit covers first-party content, not the contents of third-party AdSense creative frames. It does not claim a complete screen-reader certification or retroactively change already delivered emails.

Working evidence is in `research/image-accessibility-2026-10-23/` (inventory, 12 visual-review sheets, per-image descriptions and changes, and live blog inventory).
