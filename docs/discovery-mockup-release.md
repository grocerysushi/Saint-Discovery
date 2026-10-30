# First-step discovery release

Implements the approved `design-mockups/first-step-2026-10-30` design using the existing production quiz rather than shipping its four-question demonstration.

The homepage contains the real quiz entry and an explicitly labeled example discovery. The shared quiz supports all 21 steps, saved progress, Male/Female selection, backtracking, scoring, retries, translation-aware exit and result recovery. Answering enters a focused navy layout. Pause keeps the same mounted quiz state while exposing exploration. The daily reading uses the existing date-aware API, not the mockup's fixed date.

The result uses the actual matched saint, artwork and source credits. Its three-day companion provides original Meet/Reflect/Act suggestions and a downloadable HTML reading card with print styles. The document includes public saint identity only, never answer data or trait scores. Biography, prayer, sharing, related saints, email opt-in, learning guides and blog recommendations remain available. Extra learning content is collapsed to reduce clutter.

Design: navy #162d3b, ink #213a47, gold #dfc48b, paper #faf9f5, sage #dbe3df. Source Serif 4 headings and Source Sans 3 body text are bundled locally. The quiet Explore menu keeps the directory, guides, journal and classroom resources accessible. Existing privacy controls remain mounted and reachable even while quiz distractions are hidden. No backend, analytics-consent, classroom-mode, scoring or ad-free safeguards are changed.

Conversion impact is unmeasured. The intent is to reduce the step between arrival and answering and offer a useful reason to read after matching. Existing consent-gated quiz and biography events remain the measurement basis.

Validation: 196 existing tests and two new reading-card tests passed; the new tests are included in the regular test command. TypeScript and the production webpack build passed. Browser checks at desktop and 390px mobile completed all 21 quiz steps, backtracking, refresh recovery, pause/resume, actual matched result, reflection switching and reading-card download. Privacy controls kept analytics opt-in disabled without adult confirmation; classroom mode disabled email forms; refusal remained available. Mobile pages showed no horizontal overflow. No email was sent during verification.
