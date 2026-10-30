# First step — standalone Saint Discovery mockup

Created October 30, 2026. No production files, backend records or deployment settings changed.

## One bold change
Make the homepage the first quiz step, removing the separate landing-page-to-quiz transition. Keep library choices in an Explore dialog and Saint of the Day as one quiet daily reading strip. The user’s specified Male/Female first question is preserved. The second question is illustrative, not the production scoring implementation.

## Design plan and critique
- Palette: navy #162d3b, ink #213a47, gold #dfc48b, paper #faf9f5, fog #e8edeb. Retains continuity with the inspected live design.
- Type: Source Serif 4 for large conversational headings; Source Sans 3 for choices and navigation. Local files copied from existing dependencies.
- Desktop: quiet header; left 45% artwork and emotional invitation; right 55% directly answerable quiz; one daily reading strip; small footer.
- Mobile: question first, artwork second. Visitors can act without scrolling past a large painting.
- Rejected a generic card-grid redesign: it would simply restyle the existing competing destinations. The design's distinctive change is the entry behavior, with one continuous screen rather than another promotional hero.

## Boundaries
Two illustrative steps, Back, Explore, daily saint and information dialogs work. No real matching, email, analytics, cookies or data submission. Existing live privacy/classroom controls would be preserved in any separately authorized implementation. External reading links open the live site read-only in a new tab.

## Artwork
El Greco, Saint Francis Receiving the Stigmata. The Walters Art Museum, public domain. https://art.thewalters.org/object/37.424/ . Existing site asset copied locally and fitted without further cropping. Visible credit retained.

## Hypothesis
Starting directly may increase quiz starts by reducing competing choices and removing a navigation step. This is unproven; evaluate completed quizzes per consented landing session, not start rate alone, and monitor directory use and mobile abandonment. No lift or traffic claim is made.

Run `node server.cjs` and open http://127.0.0.1:3264 . All files remain separate from the real site repository.

## Iteration two: show the value before asking for the time
The static art panel is now an interactive example discovery with biography, original reflection and a concrete suggested practice. The practice downloads as a plain text keepsake; no email or account is requested. The sample is explicitly not a calculated result and never changes in response to gender selection. Verified the biographical summary against the live Francis biography on October 30, 2026. On mobile the sample opens on request in a native dialog so it does not push the quiz below the fold. Existing two-step demo, navigation, daily reading and privacy boundaries remain. Hypothesis: making the outcome tangible may improve completed quizzes per landing session; no measured increase is claimed.

## Iteration three: the homepage gets out of the way
Choosing Male or Female now transforms the page into a quiet navy quiz view. The sample, reading links and promotional navigation disappear until the visitor pauses or returns to the first question. Four illustrative steps demonstrate forward/back navigation, visible prior choices, progress and pause/resume. Pausing keeps answers only in page memory; reloading clears them. The brand link opens the pause dialog during a quiz to avoid an accidental reload. The prototype stops honestly after step four and calculates no result. This does not alter the production quiz's questions, matching, consent or storage.

Design retains navy/cream/gold and existing fonts, but spends the change on the interaction boundary: exploration before starting, concentrated attention while answering. Hypothesis: fewer competing actions after starting may improve completion; test completion per started quiz, mobile abandonment and pause/resume use before making a production decision.

## Iteration four: a result worth returning to
Replace the four-step dead-end notice with a full-page example three-day companion: Meet, Reflect, Act. It always uses the existing Francis example and explicitly says no match was calculated. Existing scoring, question count, first gender question and live site remain untouched. A direct preview button on the homepage also opens the companion. Return restores the current quiz step and selections.

Design direction: navy #162d3b, ink #213a47, gold #dfc48b, paper #faf9f5 and sage #dbe3df; Source Serif 4 for saint and reading headings, Source Sans 3 for navigation. Desktop: [fitted artwork | saint name / three-day reading / keep reflection]. Mobile: compact artwork and source, name, day selector, reading. All reading left aligned. Rejected a generic result dashboard with score charts and badges: the distinctive value is three practical encounters with a real saint, without suggesting a psychological diagnosis or inventing matching evidence. Only the selected day's content is visible.

The primary first-day action opens the established biography. Other days use clearly attributed original reflection/practice copy, not fabricated quotations. A working HTML reading-card download includes all three days, a biography link and print styling. No email gate, notification schedule, analytics or persistent answers. Hypothesis: a useful take-away may increase biography readership and voluntary return visits; no lift is measured or claimed. Production implementation would need real matching integration and consent-respecting measurement under separate authorization.
