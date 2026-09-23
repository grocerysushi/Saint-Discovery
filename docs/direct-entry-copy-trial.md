# Homepage clarity trial

Prepared September 23, 2026. Code is local; the trial begins only when deployed. Record the production deployment timestamp before comparing periods. This is a before/after pilot, not a randomized A/B test.

## Evidence and scope

GA4 property 522468250, August 26–September 22, 2026. Reader filters: Hostname exactly `www.saintdiscoveryquiz.com`; Page path and screen class does not contain `/admin`; Test data filter name does not contain `Traffic`. Historical unmarked owner activity may remain. The comparison below is `(direct) / (none)` versus `google / organic`, not all search engines combined.

| Entry page | Direct sessions | Direct engaged sessions | Direct engagement | Google organic engagement | Google organic sessions |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 863 | 470 | 54.5% | 75.3% | 4,114 |
| `/quiz` | 110 | 60 | 54.5% | 28.4% | 215 |
| `/confirm` | 47 | 28 | 59.6% | 66.7% | 9 |
| `(not set)` | 41 | 2 | 4.9% | 9.5% | 189 |
| `/saints/hildegard-of-bingen` | 27 | 12 | 44.4% | 26.9% | 26 |
| `/resources` | 19 | 5 | 26.3% | 38.0% | 50 |
| `/saints/teresa-of-avila` | 19 | 0 | 0% | 20.0% | 30 |
| `/saints/therese-of-lisieux` | 18 | 2 | 11.1% | 27.5% | 40 |
| `/saints/jude-thaddeus` | 17 | 3 | 17.6% | 0% | 1 |

The homepage accounts for about 58% of the 1,494 direct sessions and 393 non-engaged sessions. It is the strongest candidate by volume. A non-engaged session is not proof the visitor exited from that particular page or failed their task. `/quiz` and Hildegard perform better for direct traffic than Google organic, so the overall source gap does not justify changing every entry page. The other biography samples are small. Confirmation is a task-completion journey; maximizing its reading time is not the goal. `(not set)` is a measurement bucket, not a page to rewrite.

The homepage gap appears on both main device groups:

| Device | Direct sessions | Direct engagement | Google organic sessions | Google organic engagement |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 609 | 52.4% | 3,243 | 72.1% |
| Desktop | 236 | 56.8% | 800 | 83.4% |
| Tablet | 17 | 94.1% | 63 | 73.0% |

Tablet data is too sparse for a confident design decision. Device mix alone does not explain the gap, but source attribution, visitor intent, historical owner activity, and measurement can still contribute.

Google defines [direct traffic](https://support.google.com/analytics/answer/15258820?hl=en) as traffic without a clear referral source. Do not assume all direct visitors typed the address or already know the site. An [engaged session](https://support.google.com/analytics/answer/12195621?hl=en) lasts longer than ten seconds, has a key event, or has at least two page/screen views. Key-event and traffic-filter changes on September 23 confound a simple engagement-rate before/after comparison. Consistent [campaign tagging](https://support.google.com/analytics/answer/12923437?hl=en) on future outreach links can reduce attribution ambiguity; do not add campaign tags to internal links.

## Copy and actions

`components/Hero.tsx` now says **Free Catholic saint quiz**, explains that answers lead to a saint match and a story, feast day, and prayer, and offers **Take the free quiz** and **Browse saint biographies**. The existing 3–5-minute, free, no-account reassurance remains. Routes, headline, layout, and Saint of the Day remain intact.

Separate CTA events:

- `homepage_quiz_click`: hero link to `/quiz`.
- `homepage_directory_click`: hero link to `/resources`.
- Both include `link_placement=home_hero` and `content_version=clear_intro_v1`.

These are not key events and are not quiz starts or completions. Existing `quiz_start` requires an actual selection. No personal data or quiz answers are added. The existing analytics guard excludes local, preview, and administration visits. `content_version` is not registered as a custom dimension; use the distinct event names for the saved report. Existing Biography link placement can identify `home_hero` despite its older display name.

## Evaluation

[Acquisition quality exploration](https://analytics.google.com/analytics/web/#/analysis/a131600271p522468250/edit/stTzArOeSu-gL1lOnGNAGw) contains the landing-page and homepage-device baselines plus a homepage-action tab. New click events have no historical baseline. Raw event or active-user ratios are not session conversion rates or proof of an ordered journey.

1. After deployment, verify the two actions in a marked developer visit; check normal reader collection separately. Keep testing filters in Testing until validated.
2. Review at least two complete weeks and preferably 200 direct homepage-entry sessions before a directional decision. This is a planning threshold, not a statistical significance guarantee. Extend the window if traffic is sparse.
3. Evaluate actual quiz starts, completed quizzes, and biography-directory choices among homepage entrants. Use a session-scoped homepage-entry segment or the ordered quiz funnel when assessing conversion, rather than dividing independent event counts. Check direct mobile and desktop separately, with Google organic as context.
4. Preserve functional guardrails: both destinations work, quiz completion does not deteriorate, and the copy remains readable. Avoid attributing changes in engagement solely to wording while new key events and owner-traffic classification are taking effect.
5. Treat any observed improvement as directional. A randomized experiment with a stable measurement baseline would be needed for a stronger causal claim. Do not broaden changes to low-volume biographies based only on these percentages.

## Verification

- Targeted ESLint and TypeScript checks passed.
- Existing analytics tests: 13 passed.
- Browser verified revised homepage appearance, primary navigation to the quiz introduction, and secondary navigation to the saint directory.
- No production traffic was generated by local testing. Performance impact and live event receipt remain to be assessed after deployment.
