# Editorial design, October 2026

Goal: make the enlarged Catholic directory useful as a reading and discovery
resource while keeping the existing quiz questions, choices, order, weights,
shuffle and scoring code unchanged.

## Direction before implementation

The old directory uses a large promotional introduction, hidden filters and
hundreds of equally prominent cards. On mobile, the first result starts about
650 pixels down the page. Biography navigation begins with reflection before
the biography. The homepage leaves a large blank illustration when remote art
fails. Baseline screenshots cover desktop (1440px) and mobile (390px).

Palette: paper #ffffff, pale violet #f4f2f7, ink #28232f, secondary ink #625b6c,
violet #543773, border #d8d1df. Source Serif 4 gives names and reading text a
book-like rhythm; Source Sans 3 makes controls and facts easy to scan. Both
open-source families are bundled locally with their package license files.

Home: a clear introduction, working directory search, the existing quiz route,
and one contextual work of sacred art. The artwork is the already bundled
public-domain/CC0 El Greco painting in public/images/ATTRIBUTION.md; a caption
links the artist, subject and museum source. Daily discovery becomes a compact
text section, independent of image availability.

Directory: concise title; persistent search; useful visible desktop filters;
compact mobile filter disclosure; results with life context and dates. Query
parameters retain filters through biography/back navigation and allow a search
to be bookmarked. All canonical biographies remain in server-rendered HTML.

Biography: the name and factual summary establish identity, followed by the
life story. A narrow desktop contents rail gives access to sources and related
reading; mobile uses compact wrapping contents links. Sources, uncertainty notes, prayers
and existing content remain available and retain their section IDs.

```
Home        title + search + quiz       contextual Francis painting
            daily reading              ways into the directory
Directory   filters | search + count + two-column list of lives
Biography   title and facts
            contents | readable biography, context, sources
```

Critique: a beige-and-gold imitation manuscript and decorative church arches
would repeat the usual template. Use a white reading surface instead, with
one painting as the visual emphasis. No ornamental numbering, automatic motion,
invented portraits, or repeated status badges on every saint. Borders distinguish
controls and entries rather than boxing every section. Text is left-aligned.

The redesign applies to home, directory and profiles, plus shared navigation.
Other existing experiences retain their behavior. The quiz baseline includes
its data and interaction/scoring modules, verified against commit 32fc562.

## Repeatable verification

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` and
`npm run test:seo`. Start the resulting build with `npm start -- --port 3100`,
install Chromium once with `npx playwright install chromium`, then run
`npm run test:design`. `DESIGN_BASE_URL` selects a different local port;
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an already installed Chromium.
`DESIGN_EVIDENCE_DIR` selects where the screenshots and JSON report are saved
(the default is a temporary directory, outside the checkout).

The browser check covers eight desktop/mobile page views with axe WCAG A/AA
checks, narrow-screen overflow, home search, combined filters, reload/back
restoration, empty results, keyboard and mobile menus, and the quiz opening/back
flow. It blocks POST and other write requests. Automated checks supplement
visual review; they do not claim a complete accessibility certification.

Quiz preservation tests hash the seven question, answer, shuffle and scoring
files against the pre-design commit, normalizing only Windows line endings.

Release verification on 2026-10-02: 116 unit/content tests, six generated SEO
tests, lint, TypeScript and production build passed. The production-build browser
run passed all interactions and eight axe scans, with no browser exceptions or
horizontal overflow. Screenshots were visually reviewed at 1440px and 390px;
overflow was also checked at 320px. The mobile directory's first result now
starts around 490px instead of the previous roughly 650px.
