# Subscription and email abuse controls

Reviewed October 26, 2026 after the user supplied an Instagram security checklist.

## Database access

`email_signups` accepts writes only through the server's admin client after a signed confirmation token is verified. Anonymous and ordinary authenticated clients have no direct table privileges. The confirmation RPC is executable only by `project_admin`; unsubscribe remains server-only. Historical subscriber records are preserved, not retroactively certified as consented.

The unused browser insert into `quiz_results` has been removed and its public privileges revoked. Existing rows are preserved. Quiz matching and recovery remain in the browser; GA4 `quiz_complete` tracking is unchanged and continues to respect the existing analytics controls.

## Shared send limits

Every confirmation/result email passes through `sendEmail`, which first calls the admin-only `reserve_email_send` RPC. A transaction-level advisory lock serializes reservations across server instances. The function uses database time and enforces:

- 90 total send attempts in a rolling 24 hours, combined across both purposes.
- 30 total attempts in a rolling minute.
- Three attempts per normalized recipient and purpose in a rolling hour, at least 60 seconds apart.

These are conservative application limits, not statements about a provider's pricing or a guaranteed dollar cap. Failed sends still consume a reservation. Confirmation and result have separate recipient cooldowns so a reader can immediately receive their result after confirming. When the limiter fails or refuses a reservation, no provider request is made; the existing UI offers a retry. A future increase should be deliberate and consider provider allowances and observed legitimate demand.

The reservation table stores keyed HMAC hashes, purpose, and timestamps, never plaintext addresses or IPs. Expired reservations are removed on the next valid reservation attempt, so at most 90 recent rows remain during normal use. The table has RLS enabled, no browser grants, and an admin-only RPC. Existing instance-local IP and cooldown checks remain as an inexpensive first filter.

The signup endpoint enforces 4,096 bytes while streaming the body, even without Content-Length. Oversized bodies return 413 before parsing, saint lookup, or email. Subscribe and confirm have a 30-second function duration ceiling; the provider request has a 10-second timeout and no automatic retry. Image imports separately retain allowlisted hosts, bounded sizes/redirects, and timeouts.

## Validation and deployment

Migration: `20261026225452_close-public-writes-and-bound-email.sql`. Apply it before deploying the application change. `tests/email-budget-database.sql` contains synthetic checks intended only for an isolated transaction that rolls back. The CLI rejects explicit transaction-control SQL; this review tested inside the migration runner's transaction with a deliberate final exception, then verified no schema/test subscription remained before applying the unchanged final migration. No paid backend branch was provisioned.

Database tests covered browser denial, preserved admin confirmation, duplicate suppression, cooldown, hourly/minute/day ceilings, and expiry cleanup. Email tests cover a failed/unavailable limiter preventing provider calls and verify plaintext addresses do not enter the RPC payload. No test email is sent by these tests.

## Scope and limits

The video supplies audit topics, not verified legal conclusions. This review is not an accessibility certification, a penetration test, or a guarantee against all abuse. It did not send marketing texts, simulate a DDoS, enable a paid plan, change ad suitability, or change advertising-personalization settings.

Vercel documents automatic DDoS mitigation and Hobby usage limits; reaching free limits can interrupt availability. Database/email providers have their own allowances. Preserve optimized images and conservative caching; spending alerts alone are not application rate limits.

Sources: https://vercel.com/docs/plans/hobby and https://vercel.com/docs/vercel-firewall/ddos-mitigation.
