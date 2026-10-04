# Focused content improvements — October 4, 2026

## Scope and progress

- [x] Audit the actual 487-record published catalog before editing.
- [x] Revise two biographies and add four distinct source-reading guides.
- [x] Connect quiz results to biography, evidence and reflection, preserving quiz logic.
- [x] Add four paired reading paths, source limitations and direct correction links.
- [x] Complete final build, tests and desktop/mobile browser validation.
- [ ] Publish: blocked by the existing execution approval restriction; no push attempted in this content pass.

Google's notice identified low-value content, not a particular faulty page or a
traffic threshold. This work improves reader utility; it does not establish that
the site meets every AdSense requirement or guarantee approval. No resubmission
was requested or performed.

## Concrete edits and source work

**Ignatius of Loyola:** removed the repeated Paris/Rome sequence. The final two
paragraphs now distinguish the companions' formation from his subsequent
leadership. Identity, feast information and first-paragraph summary stay intact.
Sources consulted: [Vatican News biography](https://www.vaticannews.va/en/saints/07/31/st--ignatius-of-loyola--priest--founder-of-the-jesuits.html)
and [Jesuit Conference reference](https://www.jesuits.org/glossary/ignatius-of-loyola-1491-1556/).

**Peter Faber:** expanded the concise account with his role in the early
community, reconciliation and spiritual legacy. The later interpretation is
attributed, not presented as contemporary reporting. Sources consulted:
[Society of Jesus canonization letter](https://www.jesuits.global/saint-blessed/saint-peter-faber/)
and [Francis's January 3, 2014 homily](https://www.vatican.va/content/francesco/en/homilies/2014/documents/papa-francesco_20140103_omelia-santissimo-nome-gesu.html).
The canonical identity, directory-only quiz exclusion and unknown feast date
remain intact. Edit the research batch and regenerate with `npm run directory:build`;
do not edit generated directory additions alone.

**Four new guides:** Francis of Assisi (rebuilding/community diagram), Catherine
of Siena (bridge imagery), Ignatius (decision sequence), and Faber (testimony
versus later commentary). Each has an original exercise, source context and a
sourced FAQ. Additional sources checked:
[Francis audience](https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100127.html),
[Catherine audience](https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20101124.html),
[Jesuit Conference introduction](https://www.jesuits.org/about-us/ignatius-of-loyola/),
[Office of Ignatian Spirituality](https://www.jesuitseastois.org/spiritualexercises).
These checks were AI-assisted, not an independent human theological review.
The other four existing guides were preserved.

**Learning journey:** personal and shared results link directly to biography,
sources and a tailored exercise where present; otherwise they offer a clearly
labeled general reading task. `/resources/reading` pairs eight existing profiles
around four questions, without changing matches or rankings. It is discoverable
through the directory, Guides navigation, footer and result panel. Shared results
remain noindex and do not expose answers or scores.

**Editorial transparency:** source sections explain the actual recorded method,
AI assistance and review limits; correction email links include the page and
request a specific passage and supporting source. The editorial policy names
the completed work and explicitly distinguishes the remaining collection-wide
review. Profile/sitemap revision dates now take the latest actual biography,
contribution or reading-guide date; a new exercise does not alter a biography's
own review date. No date is derived from build time.

## Measured coverage after this pass

`npm run content:audit` reports 487 records, 60 biographies under 150 words,
254 biographies with one distinct source URL, eight tailored guides, 426
contribution sections, and 65 unspecified feast dates. No new identities were
added. The length/source figures are triage measures, not quality thresholds.
The audit does not detect semantic repetition reliably and does not check
outside-site duplication. See `docs/content-quality-audit.md` for the baseline
and methodology. The remaining 479 profiles have no tailored reading guide;
the remaining historical/claim review is substantial and not completed here.

## Validation and release

Run `npm test`, `npm run lint`, `npm run build`, `npx tsc --noEmit`,
`npm run test:seo`. Start the production build, then run `npm run test:design`
and `npm run test:learning` with `DESIGN_BASE_URL`, `DESIGN_EVIDENCE_DIR`, and
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` as needed. Browser tests block write requests.
The existing seven-file hash baseline protects exact questions, choices,
weights, ordering/shuffle code and scoring. The theme's CSS and calendar are
untouched by this content pass. Blog runtime credentials are not required for
these tests, and no production database or private data is changed.

Final validation passed: 126 unit/content tests, seven generated-page SEO tests,
ESLint, explicit TypeScript check, and production build (565 pages). The design
suite passed 22 desktop/mobile page/calendar accessibility scans; the learning
suite passed 18 more. No browser exceptions or horizontal overflow were found.
The learning test verifies the personal result to biography and back journey
retains all six scores, a shared page never exposes those scores, the general
fallback reaches an existing reflection section, keyboard navigation works,
and an unknown shared-result identity returns 404. Browser evidence is outside
the repository at `../design-evidence/content-quality/` (report.json and
learning-report.json with screenshots); test logs use `../content-quality-*`.
All browser checks used the local production build, not CSS injection. These
results do not establish deployment; post-publication checks remain pending.

Official guidance consulted:
[AdSense content and user experience](https://support.google.com/adsense/answer/10015918?hl=en)
and [Google's helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
