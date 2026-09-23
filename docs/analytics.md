# Conversion measurement

GA4 property: Saint Discovery Quiz (`522468250`). Google tag: `G-C75CMC27YN`.

On September 23, 2026, `quiz_complete` and `generate_lead` were marked as key events in the live property. Both use **Once per event** counting. No monetary values were invented. Existing unrelated key-event definitions were left intact.

## Event definitions

| Event | Trigger | Key event? |
| --- | --- | --- |
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

Step 1 is the introduction; steps 2–21 are the twenty quiz questions. Backtracking does not duplicate step views/completions. Reopening a saved result does not start or complete another quiz. A restart resets the attempt counters. No gender, selected answers, trait scores, email addresses or receipt IDs are sent in custom event parameters.

Live event-scoped custom dimensions:

| Display name | Parameter |
| --- | --- |
| Quiz step | `quiz_step` |
| Quiz step type | `step_type` |
| Biography link placement | `link_placement` |
| Saint slug | `saint_slug` |

Biography placement values: `result_primary`, `result_next_steps`, `result_related`. `total_steps` also accompanies quiz events for troubleshooting.

The new email diagnostic parameters `request_type` and `error_type` are sent in events but are not yet registered as GA4 custom dimensions. Request types are `initial`/`resend`; errors are `rate_limited`/`send_failed`/`network`. They contain no addresses or tokens. Email-stage events support diagnosis, not proof of unique subscribers. In particular, submission is distinct from a successfully saved subscription.

## Confirmed subscriptions

Migration `20260923135050_record-confirmed-subscription.sql` is applied to the linked InsForge project. Its server-admin-only RPC serializes confirmations per normalized email and returns true only for a new row. It preserves historical duplicates and does not change table RLS. Public and authenticated users cannot execute the RPC.

The confirmation endpoint issues a signed, short-lived, HttpOnly receipt only after that RPC succeeds with true. Existing subscribers, invalid tokens and database failures get no receipt. Email delivery remains a separate operation: a newly saved confirmation qualifies even if result-email delivery is pending. A directly entered `/subscribed?status=ok` URL cannot create the event without a valid receipt.

The receipt contains an opaque random ID and expiry, not an email. Browser storage suppresses replay across page reloads; memory suppresses React effect replays when storage is unavailable. Storage-blocked reloads can still overcount within the receipt lifetime. Ad blocking, cookie blocking, closing the page before it loads, or a network outage can undercount. GA4 is an attribution/behavior tool, not the authoritative subscriber ledger.

The Google tag bootstrap now runs before hydration and queues events until Google's script loads. Custom events and initial configuration are restricted to the two production domain names. Confirmation tokens are removed from explicitly supplied analytics page URLs/referrers. Do not enable diagnostic tracking that includes raw email-link URLs.

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
