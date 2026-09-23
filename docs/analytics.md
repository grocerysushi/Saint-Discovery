# Conversion measurement

GA4 property: Saint Discovery Quiz (`522468250`). Google tag: `G-C75CMC27YN`.

On September 23, 2026, `quiz_complete` and `generate_lead` were marked as key events in the live property. Both use **Once per event** counting. No monetary values were invented. Existing unrelated key-event definitions were left intact.

## Event definitions

| Event | Trigger | Key event? |
| --- | --- | --- |
| `homepage_quiz_click` | Homepage hero's Take the free quiz link | No |
| `homepage_directory_click` | Homepage hero's Browse saint biographies link | No |
| `quiz_start` | First selection in a fresh quiz attempt, including an explicit restart | No |
| `quiz_step_view` | First view of each step in that attempt | No |
| `quiz_step_complete` | First answer to each step in that attempt | No |
| `quiz_step_back` | Visitor selects Previous question | No |
| `quiz_complete` | Final answer produces a saint match | Yes |
| `biography_click` | Primary biography, next-steps biography, or related-saint link on the personalized quiz result | No |
| `email_signup` | Initial confirmation request is accepted by the provider; not proof of confirmation or delivery | No |
| `email_confirmation_request` | Initial or resend request begins (`request_type`, `saint_slug`) | No |
| `email_confirmation_error` | Send, network or rate-limit error (`request_type`, `error_type`) | No |
| `email_confirmation_resend` | Another confirmation email is accepted by the provider | No |
| `email_confirmation_view` | A valid confirmation page mounts in the browser | No |
| `email_confirmation_submit` | Visitor submits the confirmation button | No |
| `email_result_resend` | Visitor submits the result-email recovery form | No |
| `generate_lead` | Verified email confirmation creates a new saved subscription and the browser loads the receipt-bearing confirmation page | Yes |
| `article_recommendation_view` | At least half of an article card enters the viewport, once per mounted card | No |
| `article_recommendation_click` | Visitor selects a recommended article | No |
| `blog_discovery_click` | Visitor selects Browse all articles in the recommendation section | No |

Step 1 is the introduction; steps 2–21 are the twenty quiz questions. Backtracking does not duplicate step views/completions. Reopening a saved result does not start or complete another quiz. A restart resets the attempt counters. No gender, selected answers, trait scores, email addresses or receipt IDs are sent in custom event parameters.

Live event-scoped custom dimensions:

| Display name | Parameter |
| --- | --- |
| Quiz step | `quiz_step` |
| Quiz step type | `step_type` |
| Biography link placement | `link_placement` |
| Saint slug | `saint_slug` |
| Recommended article | `article_slug` |
| Recommendation version | `recommendation_version` |
| Recommendation position | `recommendation_position` |

Biography placement values: `result_primary`, `result_next_steps`, `result_related`. `total_steps` also accompanies quiz events for troubleshooting.

Homepage hero actions reuse `link_placement=home_hero` and add `content_version=clear_intro_v1`. They measure link selection, not actual quiz participation. `content_version` is not registered as a custom dimension. See [the homepage clarity trial](direct-entry-copy-trial.md) for the source/landing-page baseline and rollout evaluation. These events begin only after deployment and are deliberately not key events.

Blog discovery reuses `link_placement` with `result_blog` and `biography_blog` (the existing GA4 dimension is named **Biography link placement**). The three article dimensions above were added in the live property on September 23, 2026. `recommendation_version` starts at `v1`; positions are 1 or 2. See `blog-discovery-trial.md` for the rollout evaluation. These events contain article/saint slugs, never quiz answers, trait scores, email addresses or visitor profiles.

The new email diagnostic parameters `request_type` and `error_type` are sent in events but are not yet registered as GA4 custom dimensions. Request types are `initial`/`resend`; errors are `rate_limited`/`send_failed`/`network`. They contain no addresses or tokens. Email-stage events support diagnosis, not proof of unique subscribers. In particular, submission is distinct from a successfully saved subscription.

## Confirmed subscriptions

Migration `20260923135050_record-confirmed-subscription.sql` is applied to the linked InsForge project. Its server-admin-only RPC serializes confirmations per normalized email and returns true only for a new row. It preserves historical duplicates and does not change table RLS. Public and authenticated users cannot execute the RPC.

The confirmation endpoint issues a signed, short-lived, HttpOnly receipt only after that RPC succeeds with true. Existing subscribers, invalid tokens and database failures get no receipt. Email delivery remains a separate operation: a newly saved confirmation qualifies even if result-email delivery is pending. A directly entered `/subscribed?status=ok` URL cannot create the event without a valid receipt.

The receipt contains an opaque random ID and expiry, not an email. Browser storage suppresses replay across page reloads; memory suppresses React effect replays when storage is unavailable. Storage-blocked reloads can still overcount within the receipt lifetime. Ad blocking, cookie blocking, closing the page before it loads, or a network outage can undercount. GA4 is an attribution/behavior tool, not the authoritative subscriber ledger.

The Google tag bootstrap now runs before hydration and queues events until Google's script loads. Custom events and initial configuration are restricted to the two production domain names. Confirmation tokens are removed from explicitly supplied analytics page URLs/referrers. Do not enable diagnostic tracking that includes raw email-link URLs.

## Reader, owner, and test traffic

On September 23, 2026:

- Verified the existing **Internal Traffic** data filter: Exclude `traffic_type=internal`, **Testing**.
- Created **Developer Traffic**: Exclude debug-mode events, **Testing**.
- Created and applied the saved **Reader pages - production** comparison to Pages and screens. It requires Hostname exactly `www.saintdiscoveryquiz.com`, Page path and screen class not containing `/admin`, and Test data filter name not containing `Traffic` (covers the two named testing filters). It is a reversible reporting comparison, not a permanent collection filter. It deliberately covers the canonical host, not Google Translate proxy hosts. All Users remains available.

Local code changes (effective after deployment):

- Admin `/admin` and descendants, local hosts, and preview hosts do not initialize or load the Google Analytics script. Only the two production domain names can load it.
- A client-side navigation into admin sets Google's documented `ga-disable-G-C75CMC27YN` flag before history listeners run. Back/forward and restored pages also guard admin; that document stays disabled until a full public-page load. Custom events independently reject admin routes and the disabled flag. No authentication changes were made.
- The admin layout has **Analytics for your own visits**, available without signing in. It changes only this browser's classification; it never grants editor access. Choose **My own visits (internal)** for ordinary owner browsing or **Testing (DebugView)** for a diagnostic visit, then use **Open the homepage with this setting**. Internal adds `traffic_type=internal`; developer adds `debug_mode=true`; normal readers receive neither. The debug parameter is omitted, never set to false.
- The preference is stored as `sd:analytics-mode` per browser and origin. Configure each browser/device you use and use the canonical www address. Clearing site storage clears it; blocked storage displays a failure. Other open tabs stop collecting on a preference change until reloaded, so they cannot keep sending the old classification. No IP address was guessed or network-wide exclusion introduced.
- While filters remain in Testing, labeled internal/debug events still exist in All Users. Use the saved reader comparison to hide them. Unmarked past owner activity on public pages cannot be reliably removed retroactively.

### Validate before activating

1. Deploy the code, open the canonical admin page, choose internal mode, and open the homepage with the provided link. Make a small, recognizable visit without generating fake conversions. Repeat with developer mode for DebugView; return your usual browser to internal mode afterward.
2. Compare with an unmarked browser on the same public page. In a free-form Exploration use **Test data filter name** and **Event name** as rows, **Event count** as values. Only the intended internal/debug events should match. A normal reader must not match either filter. Verify admin pages produce no new events and preview/local visits remain absent.
3. Allow 24-36 hours for filter processing. A lack of matches immediately after setup is not proof the rules work. Keep both filters in Testing until the expected matches and the normal-reader control have been checked.
4. Only then activate the tested exclusion filters. Active exclusions permanently discard future matching events; they cannot clean historical data. Preserve the reader comparison for historical admin-path/hostname filtering.

Verification: 65 automated tests pass, covering early event queues, direct/encoded admin routes, local/preview loads, SPA history, back/forward, mode selection, unavailable storage, and cross-tab changes. Production build passed. The live comparison retained reader data (16,377 views versus 16,548 All Users, August 26-September 22, 2026); this difference includes all comparison conditions and is not a count of the owner's activity. Processed internal/developer matches remain pending deployment and the validation period.

References: [Google internal-traffic testing](https://support.google.com/analytics/answer/10104470), [developer-traffic testing](https://support.google.com/analytics/answer/13296662), [programmatic Analytics opt-out](https://developers.google.com/tag-platform/security/guides/privacy), [DebugView](https://support.google.com/analytics/answer/7201382).

## Reading the reports

In GA4 Reports, select `quiz_complete` or `generate_lead` in the Key events selector to compare acquisition channels and landing pages. Use separate outcomes; summing them measures interactions, not unique people.

In Explore → Funnel exploration, use `quiz_start`, then `quiz_step_complete` filtered by Quiz step (2 onward), then `quiz_complete`. For the result journey, use `quiz_complete` followed by `biography_click`, or followed by `email_signup` then `generate_lead`. Confirmation can happen in another browser/device, so that final sequence is not always attributable to the original quiz visitor. These are GA user funnels; repeated attempts and aggregate event ratios are not interchangeable with user conversion rates.

Marking a key event is prospective; historical completion counts do not become historical key-event counts. New custom dimensions can take 24–48 hours to become reportable. See [Google's key-event guide](https://support.google.com/analytics/answer/13128484) and [event-scoped custom dimensions](https://support.google.com/analytics/answer/14240153).

## Validation and release

- 48 automated tests passed, including queue timing, local traffic exclusion, attempt deduplication, signed receipts, invalid confirmations, database failures and forged success URLs.
- TypeScript, targeted ESLint and the production build passed (545 generated pages).
- Browser checks covered all 21 quiz steps, backtracking, completion, biography navigation, saved-result recovery and restart.
- InsForge verification: a synthetic new subscription returned true, a repeated normalized address returned false, and the synthetic record was removed. No email was sent. Admin execution was allowed; anonymous/authenticated execution was denied.
- The CLI's documented DO-block rollback rehearsal was rejected by its SQL parser; the explicit synthetic-record test above was used instead.

GA4 settings and the database function are live. Website instrumentation takes effect after these code changes are deployed. After deployment, verify a real quiz completion and consenting real confirmation in Realtime, then review processed reporting the next day. Local testing deliberately does not populate the live property.
