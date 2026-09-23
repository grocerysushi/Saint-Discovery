# Email confirmation investigation — September 23, 2026

## Live evidence

Read-only inspection of the signed-in [Resend Metrics dashboard](https://resend.com/metrics), Emails and Domains pages. Selected **Last 30 days**, August 25–September 23, 2026. This is not asserted to match the earlier GA4 reporting window or population.

- 292 emails; displayed delivery rate 97.95%.
- Six bounces (2.05%): four permanent, two transient. All six entries had confirmation-email subjects, including the older “One last step to see your saint match.”
- Zero complaints displayed.
- The **Delivery delayed** filter returned no results for the same 30-day window. This shows no messages currently carrying that status; it does not rule out earlier delays on messages that later delivered.
- A September 22 confirmation addressed to a mistyped `gmail.con` domain bounced immediately. SMTP diagnostic: `550 5.4.4 Invalid domain`. Resend classified that failure as transient/general; the application must not assume every “transient” bounce is fixable by resending unchanged.
- Sending domain, DKIM, SPF TXT and return-path MX showed **verified**. No DNS changes were needed. The optional DMARC row had no verification status; this audit makes no claim about its live DNS state.
- Provider delivery is distinct from inbox placement, reading, or confirming. These are message totals, not distinct people or a joined GA4 funnel. They do not establish why every unconfirmed visitor stopped.

The local environment had no usable Resend API key and Vercel's environment export returned an empty key value. Dashboard inspection was used instead. This does not mean the production deployment lacks a key. No test emails, retransmissions to existing recipients, tracking-setting changes, or subscriber-list modifications were performed.

## Defects and changes

1. The old public request endpoint returned success even for validation, throttling and provider errors. It now returns honest errors and retry timing, without looking up or disclosing membership. Success means provider acceptance. Bot honeypot submissions intentionally remain silent drops.
2. The old success panel removed the form without resend or address correction. The new panel shows the entered address, exact subject, spam-folder guidance and both required confirmation steps. Users can resend after a countdown or change the address. Common domain typos are suggestions requiring an explicit choice, never automatic recipient changes.
3. The email button now says “Continue to confirmation”; the website button says “Confirm & send my novena.” This keeps the deliberate POST required to protect against email scanners, while explaining why the second step exists. The seven-day link lifetime is visible.
4. The old pending page promised an automatic retry that did not exist. Recovery now provides a real POST retry using the original signed token in a short-lived HttpOnly cookie. Database failures, provider failures and cooldowns have distinct messages. Existing subscribers can still request their result without creating another conversion.
5. Recipient limits allow a send after 60 seconds and at most three attempts/hour for each purpose (confirmation or result). These remain best-effort, per warm server instance. IP and global send controls remain; shared durable limiting would be needed for a global guarantee.
6. Provider calls time out, and failures log a safe diagnostic code rather than recipient data. Accepted sends log a provider message ID so server logs can be matched to Resend. Emails, tokens and message IDs are not passed to GA4.
7. Email-stage events distinguish requests, accepted sends, resends, confirmation views, button submissions and errors. `generate_lead` remains tied to a newly persisted verified subscription, as documented in `analytics.md`.

## Verification and follow-up

- 56 automated tests passed, including provider failure, malformed requests/responses, recipient cooldown and hourly limits, returning subscribers, database failure recovery, signed conversion receipts, form resend/address correction and analytics privacy.
- Targeted ESLint and production build with TypeScript passed; 545 pages generated.
- Transport and database failure scenarios used mocks; no live email was sent.
- Local production-browser checks covered quiz completion, the address suggestion, visible send-error feedback and countdown, and expired-link recovery. The local environment has no usable provider key, so the real local request exercised the configuration-failure path without sending an email.

Website changes require deployment. After deployment, use one consenting real address to check the full two-step flow and match its provider message ID to the Resend timeline. Compare matched date ranges and separate confirmation from result-email subjects. Review `email_confirmation_error` and progression from `email_signup` → `email_confirmation_view` → `email_confirmation_submit` → `generate_lead`, acknowledging cross-device and blocked-analytics gaps. Do not infer a conversion rate by dividing the previously reported 60 and 173 aggregate events.
