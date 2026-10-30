# Analytics consent and ad removal — local review

Prepared October 29, 2026. The user approved committing and pushing this update after requesting a smaller consent banner. Local preview: http://127.0.0.1:3256/ .

## What explains the apparent traffic drop

Commit `1a89004` (October 26 at 21:25:50 America/Chicago) changed Analytics from automatic loading to explicit adult opt-in. The current production page contains that consent gate. People who refuse, leave the panel unanswered, or use classroom mode are intentionally absent from GA4. Thus pre-change GA4 totals and post-change totals measure different populations.

The authenticated GA4 review used Saint Discovery Quiz property 522468250, verified America/Chicago reporting time, All Users, and hours 00–18 inclusive for each Thursday. Its saved evidence is in the Saint-Discovery-review workspace at `research/analytics/2026-10-29-thursday-check/`.

| Date | Sessions | Engaged sessions | quiz_complete events | Organic Search sessions |
| --- | ---: | ---: | ---: | ---: |
| October 8 | 205 | 125 | 68 | 135 |
| October 15 | 178 | 107 | 48 | 122 |
| October 22 | 294 | 185 | 92 | 205 |
| October 29 | 68 | 44 | 35 | 8 |

October 29 is provisional intraday data. Events are not unique people. These figures show a decline in recorded traffic, not a quantified decline in all visitors. No consent-acceptance measurement exists to calculate the uncounted share. Search Console's latest available earlier dates showed 371, 364 and 368 clicks on October 25–27; those dates cannot establish October 29 traffic. The consent transition is a demonstrated measurement discontinuity and likely contributor, not proof that it explains every lost session or the channel distribution.

No malfunction rejecting a valid opt-in was found. Bootstrap tests confirm that an allowed visit configures GA, preserves supplied search referrers and UTM parameters, queues subsequent custom events, and does not replay events from before consent. Local previews deliberately never load GA, including after an opt-in, so local browser tests do not prove receipt by Google's production collector. No synthetic quiz completions were sent to live GA during this review.

## Local fixes

- Remove all AdSense loaders, inline slots, ad placeholders, publisher account metadata, ads.txt, and editor ad controls. Remove obsolete ad CSS. Existing saved articles with `ads: true` render without advertising. The inert legacy boolean remains for database compatibility; new drafts default to false. No content migration or database changes are needed.
- Update About, editorial policy, privacy policy, classroom help and privacy choices to describe the ad-free site. Remove Google advertising-consent callbacks; retain optional Analytics consent, adult declaration, refusal, withdrawal and classroom mode.
- Stop GA's automatic tracking when consent expires in an already-open tab. Check bounded expiry timers, restored focus, visibility and history navigation. Previously custom events checked expiry, but a previously loaded Google tag could continue its automatic collection. This privacy defect does not explain missing traffic.
- Keep email-delivery behavior, cookie clearing, analytics-off default, Google advertising-signal restrictions, token filtering, internal/developer handling and admin/local/preview suppression.

## Verification

69 targeted tests passed across consent/analytics, ad-free rendering, blog layout/storage/public listing/SEO, quiz results/recovery and email flow. Two local-fixture network cases initially failed under sandbox loopback restrictions; the full three-test blog-public suite passed when rerun with loopback access. The final changed rendering and analytics suites passed again (24 tests). TypeScript `tsc --noEmit` and ESLint on changed TS/TSX/test files passed.

Supported in-app browser checks on the local preview verified refusal survives reload, the adult checkbox enables opt-in, saving an opt-in closes the panel, classroom mode survives reload and can be exited by refusing analytics, and the panel is usable at 390×844. Local blog listing and an existing October 29 article render with zero ad slots, zero ad-network script elements and no publisher metadata. The rendering tests also exercise legacy `ads: true` content independently of classroom mode. Browser evidence is saved under `tmp/consent-ad-review/`.

## Can consent be removed?

Removing ads removes the site's AdSense-specific consent integration. It does not automatically exempt cookie-based Google Analytics from consent requirements. Requirements vary by jurisdiction; audience-measurement exemptions are narrow and depend on the actual tool and configuration. Keep the current opt-in while this GA setup remains. A separate option is to remove optional analytics entirely, or separately assess an analytics implementation that qualifies for applicable exemptions; this change does neither.

Reference: [CNIL guidance on audience measurement and consent](https://www.cnil.fr/fr/node/677). This is implementation guidance, not a determination of every jurisdiction's legal obligations.

## Release boundary

The user authorized committing and pushing all site changes. No AdSense account settings, suitability restrictions, GA property settings, payment settings, credentials or live articles were changed. Once the approved site is deployed, verify production pages and removal of ad requests. Historical AdSense earnings/account records are unaffected by removing site code.

## Compact consent follow-up

The initial panel is now a nonmodal banner with equal Keep off / Allow analytics controls and a Settings link. At 390×844 it measured approximately 153px tall with no horizontal overflow. Allow opens the Google Analytics cookie explanation and requires the existing adult declaration before saving consent. Settings includes classroom mode, the privacy policy and withdrawal. Dismissal is tab-scoped session storage only, never permission; footer settings remain accessible. Escape closes the expanded controls, and focus returns to the footer control without scrolling. The previous opt-in state remains unchanged when closing settings.

A regression test verifies that a dismissed banner with no consent neither loads Google nor queues quiz events. Mobile browser testing verifies the adult confirmation is initially disabled, dismissal survives a reload, and the footer reopens full controls. Temporary screenshots and preview files remain local rather than becoming production assets.

Final pre-release checks: 70 targeted tests passed together, changed-file ESLint passed, and the production Webpack build passed, generating 907 pages. Explicit opt-in through the new settings was saved successfully in the local browser. Existing iPhone app privacy commits on the production branch are preserved.
