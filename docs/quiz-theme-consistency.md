# One visual language, taken from the existing quiz

Latest user direction on 2026-10-02: match the currently deployed quiz across
the site. This supersedes the proposed royal-purple/ivory composition and the
previous white/violet redesign. The quiz is the reference, not a redesign target.

Use its navy answer surface (#0c1c2a) as the shared canvas, with its raised blue/navy panels (#152b3a), gold accent
(#dec48e), cream text (#faf6eb), secondary text (#c5d1d6), Source Serif 4 headings
and Source Sans 3 body/controls. Reuse the quiz's 10px panel corners, 6px control
corners, quiet border, generous control height and gold hover/focus treatment.
Keep question-card, option-button and quiz spacing rules unchanged.

Home combines a quiz-style introductory panel and the existing attributed
sacred artwork, followed by search and discovery links. The directory uses
the same panel and control treatment around search and filters, with compact
readable entries. Biography stories use the same navy panel, cream type and
gold links. The header and footer join the same palette.

Only the homepage calendar banner displays liturgical colors. It names them
in text and shows outlined swatches; it never recolors the site. A neutral
server-rendered state avoids displaying a build-machine date as the visitor's
date. Missing reviewed dates explicitly show unavailable, not a guessed color.

The 487 records, citations, routes and SEO remain unchanged. Existing hash tests
protect quiz questions, choices, order, shuffle and scoring against 32fc562.
Desktop/mobile quiz reference captures are kept outside the repository in
design-evidence/quiz-reference. Browser tests also compare shared computed
styles with the unchanged quiz and check each calendar color and date behavior.

## Validation commands

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
`npm run test:seo`. Start the production build on port 3100, then run
`npm run test:design` (home, directory, biographies, quiz, calendar previews and
real browser clock changes) and `npm run test:theme` (other public page types).
Both browser commands accept `DESIGN_BASE_URL`, `DESIGN_EVIDENCE_DIR`, and an
optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an installed Chromium executable.
They block write requests and never submit quiz results or subscription forms.

The public theme test needs a configured public blog. In an unconfigured local
checkout, use a read-only browser preview against production with
`DESIGN_PREVIEW_CSS=app/editorial-design.css`; this injects CSS only inside the
test browser, never into the website. Repeat without that variable after the
actual release. Its report explicitly identifies a local-CSS preview.
