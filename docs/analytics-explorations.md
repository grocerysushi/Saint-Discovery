# Saved Analytics explorations

Created September 23, 2026 in GA4 property **Saint Discovery Quiz (522468250)**. Open **Explore** while signed in as the owning account, Kyle Shaft. These are saved, editable explorations; they are not published to the Reports navigation or shared with other property users.

## Quiz journey

[Open exploration](https://analytics.google.com/analytics/web/#/analysis/a131600271p522468250/edit/ffFGaoiuQrOV4xbCGw0vjg)

- **Overview (tracking Sep 23+)**: closed user funnel, indirectly followed steps: `quiz_start` → `quiz_step_complete` with Quiz step exactly `2` → `quiz_complete` → `biography_click`. Breakdown: Device category.
- **Step views and answers**: Quiz step rows, Event name columns, Active users values, 25 rows. Event filter: `^quiz_step_(view|complete|back)$`. Step 1 is the introduction; steps 2–21 are the twenty questions. This table includes every step, while the overview uses the first question as a checkpoint.

The step table compares participating users, not attempt-level conversion rates. Repeated attempts, backtracking, and users spanning sessions can affect interpretation. The overview is a sequential user funnel, not a strict single-session or single-attempt funnel.

## Content discovery

[Open exploration](https://analytics.google.com/analytics/web/#/analysis/a131600271p522468250/edit/NOs_D6jiSlmbC4VPWUwzuQ)

**Biography to blog (Sep 23+)** is a closed user funnel with indirect steps:

1. `session_start` (visit begins).
2. `page_view` AND Page path and screen class begins with `/saints/`.
3. `article_recommendation_view` AND Biography link placement exactly `biography_blog`.
4. `article_recommendation_click` AND Biography link placement exactly `biography_blog`.
5. `page_view` AND Page path and screen class begins with `/blog/`.

Breakdown: Landing page. This includes visitors who enter on a biography. It measures the ordered journey across the selected period; it does not prove that the final article is the exact recommended slug or that all steps happened within one session. Article arrival is not proof the whole article was read. Result-page recommendations are outside this biography-specific funnel.

## Acquisition quality

[Open exploration](https://analytics.google.com/analytics/web/#/analysis/a131600271p522468250/edit/stTzArOeSu-gL1lOnGNAGw)

- **Engagement by source**: Session source / medium rows; Active users, Sessions, Engaged sessions, Engagement rate, Average engagement time per session values.
- **Outcomes (new definition Sep 23+)**: same source rows; Event name columns; Active users and Event count values; event filter `^(quiz_complete|generate_lead)$`.
- **Direct vs organic landing pages**: Landing page rows, Session source / medium columns, the five engagement metrics above, 500 rows; source regex `^(\(direct\) / \(none\)|google / organic)$`.
- **Homepage by device and source**: Device category rows and the same source columns/metrics; adds Landing page exactly `/`.
- **Homepage actions (copy trial)**: Session source / medium rows, Event name columns, Active users and Event count; Landing page exactly `/`; event regex `^(homepage_quiz_click|homepage_directory_click|quiz_start|quiz_complete)$`. All sources remain available. The two new hero-click events begin after the homepage copy is deployed. This is an action-count table, not an ordered conversion funnel.

The homepage trial's baseline, caveats, and evaluation plan are in [direct-entry-copy-trial.md](direct-entry-copy-trial.md). The overall direct-source gap does not apply equally to every entry page.

The separate outcome columns avoid combining completions and subscriptions. Event count includes repeat events; active users and event counts are not interchangeable. Confirmation on another device/browser may be attributed to a different session source. GA4 is not the authoritative subscription ledger.

## Reader filters and interpretation

Every tab has these AND filters:

- Hostname exactly `www.saintdiscoveryquiz.com`.
- Page path and screen class does not contain `/admin`.
- Test data filter name does not contain `Traffic` (matches the existing Internal Traffic and Developer Traffic testing filter names).

Data filters remain **Testing**. These exploration filters change reporting only. Unmarked historical owner visits cannot be reliably identified. The canonical-host restriction excludes proxy hosts, including Google Translate.

The explorations were created with the default **Last 28 days** range (August 26–September 22 at creation). Before interpreting the new quiz-step or recommendation funnels, select a period on or after deployment on **September 23, 2026** and allow processed data/custom dimensions to become available. Empty new stages in older periods are missing instrumentation, not evidence of 100% abandonment. The strengthened `generate_lead` definition also applies from deployment; earlier events must not be treated as verified under the new implementation. Marking key events does not backfill historical key-event counts.

## Verification

- All three named explorations appeared in the saved Explore list.
- Reopened the Quiz journey exploration to confirm both tabs and reader filters persisted.
- Content conditions verified in the funnel editor before saving; landing-page breakdown and reader filters verified afterward.
- Acquisition engagement and outcome columns rendered with source data and all reader filters.
- The engagement table reproduced 146 Classroom sessions, 102 engaged sessions, and 7m 35s average engagement time per session for August 26–September 22, 2026. This is a historical baseline, not evidence of the impact of today's changes.
- No site code, event definitions, permanent collection filters, authentication, or database settings were changed to create these reports.
