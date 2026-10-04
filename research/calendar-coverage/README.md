# Complete Saint of the Day calendar

Reviewed October 2, 2026. The directory previously contained 587 individual Catholic saints but had no matching individual saint for 57 civil dates. All 366 month/day combinations now resolve to a published, sourced biography.

## Editorial additions

- Added 38 original, individually sourced saint biographies in `research/directory-batches/2026-10-02-calendar-coverage.json`. The complete directory contains 625 unique individual saints.
- Added verified commemoration dates and source notes to six existing directory additions, preserving their original biographies.
- Added 13 documented additional commemorations for existing saints while preserving their main biography dates. The supplemental calendar also records Oswald of Worcester on February 28 in ordinary years; February 29 is his leap-year commemoration.
- Historical uncertainty and later traditions are qualified in the original prose. No patronage, direct quotation, miracle claim or image rights were invented.

## Calendar meaning

This is a daily saint-reading calendar. The site's separate U.S. Roman Rite liturgical calendar determines the displayed liturgical celebration. A saint's Martyrology entry, death anniversary, local memorial or religious-community celebration does not necessarily determine the Mass celebrated on that date.

The supplemental data names these distinctions, including Kateri Tekakwitha's Canadian April 17 commemoration, Bernadette's French February 18 memorial, Catherine de Ricci's February 2 Martyrology entry versus her Dominican February 4 date, and Joseph the Worker on May 1. Paul retains June 29 in his biography and is also available for the January 25 feast of his conversion. Oswald of Worcester is distinct from the existing Oswald of Northumbria biography.

## Sources and recovery

The date/identity selections are in `selections.json`; the original English biography drafts are in `editorial.json`. `source-index.json` contains the checked source URLs, titles and HTTP statuses without copied source text. `prepare.mjs` generates the new batch and supplemental calendar, and updates only the six selected earlier batch records. Run `npm run directory:build` after preparation to regenerate the published directory additions.

Sources include the Catholic Church in France's Nominis individual entries and reproduced Roman Martyrology notices, Vatican News, the Vatican, the Canadian Conference of Catholic Bishops, the dioceses of Rotterdam and Trieste, and the USCCB NABRE text for a prose discussion of Onesiphorus. Each published biography and supplemental commemoration carries its relevant source links. Research HTML snapshots are working reference material, not material to publish or bulk-commit.

`verify-links.mjs` checked all 70 distinct source links used by the selected records: all returned HTTP 200. Results are in `link-checks.json`.

## Verification

- All 127 automated tests passed, including exhaustive ordinary-year and leap-year checks covering 731 civil dates, published biography lookup, source presence and companion-date agreement.
- TypeScript and lint checks for the changed components and calendar logic passed.
- Directory compilation/check passed: 199 additions, with no groups, aliases or blesseds counted as additional individual saints.
- Preview HTTP checks passed for the homepage, February 29 daily API and page, April 17 regional commemoration, and the new Leodegar biography. The homepage shows Leodegar of Autun for October 2 and the updated 625 biography count.
- The homepage preview was inspected in the browser. New entries without verified artwork use the existing truthful artwork-unavailable presentation.

The calendar implementation, original writing, source index and verification records are included in the calendar change. Raw research snapshots and the local dashboard are excluded.
