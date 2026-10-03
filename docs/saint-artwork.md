# Directory artwork and daily selection

Prepared October 3, 2026. All 825 published canonical saint entries have an image: 540 historical artworks or photographs, 36 existing labeled AI illustrations, and 249 original symbolic images. A symbolic image is explicitly not a portrait. Do not present coverage as 825 verified likenesses.

## Image sources and rendering

`lib/saint-artwork.ts` is the common resolver for directory cards, biography pages, the homepage daily card, and Saint of the Day. Historical images take precedence over existing generated illustrations. The final fallback is the original `public/images/saint-symbolic.svg`. Failed image loads also use that symbolic image with an honest caption.

The 183 accepted additions are in `lib/data/saint-artwork-additions.json`. Their source metadata, identity checks, and 36 rejected candidates are recorded in `research/saint-artwork/selection-record.json`. Acceptance checks considered the depicted subject, creator, artwork age, and file-page rights statement. A modern photograph's license does not automatically license a depicted modern artwork. Unknown or conflicting subjects and unclear rights were rejected.

All 532 formerly remote assets are bundled as WebP files in `public/images/saint-artwork/`, resized inside 960 pixels without enlargement, cropping, or retouching. `lib/data/saint-artwork-local.json` maps source URLs to local files; `research/saint-artwork/local-assets-record.json` records source hashes, sizes, and modifications. Biography captions retain the creator, source link, rights description, and applicable license link. Keep that attribution when moving an asset. Existing generated artwork remains labeled as an artistic interpretation.

Run `node research/saint-artwork/check-images.mjs` to check every assigned asset and regenerate the coverage record. `node scripts/vendor-saint-artwork.mjs` prepares any remaining remote files and preserves the existing provenance record when no work remains. Review new artwork metadata before adding it; a successful HTTP response is not a rights or identity check.

## U.S. calendar preference

`lib/data/us-saint-calendar.json` maps 173 recurring dates to 209 saint/date associations, with sources and scope. The mapping uses the USCCB's 2026 and 2027 calendars, including the February 2026 revision adding John Henry Newman. Its upstream identity/date data and U.S. proper-calendar adjustments are recorded in `research/saint-artwork/uscc-basis.json`.

The selector orders U.S. calendar rank before image availability. It preserves companion saints and other documented recurring dates. U.S. proper dates include Vincent of Saragossa on January 23, Camillus de Lellis on July 18, and Paul of the Cross on October 20. A saint's original biography date is not silently changed to a different calendar scope.

This mapping supplies a recurring reading guide, not the Mass celebration for a specific year. Sundays, seasons, and transferred celebrations remain the responsibility of the separate dated liturgical calendar panel. Non-person observances and unmatched identities are not invented as directory entries. All 366 possible month/day keys still have a featured biography and image.

These are AI-assisted source and technical checks, not independently credited human, ecclesiastical, or legal review. Report corrections through the editorial policy page and retain the underlying provenance when making substantive changes.
