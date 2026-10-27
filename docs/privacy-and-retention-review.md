# Privacy and retention review — October 26, 2026

## What changed

- New quiz result/trait-score database writes were already removed in 93a393f. Privacy now accurately distinguishes browser recovery, consented Analytics events and the restricted historical quiz table. Historical quiz rows were not deleted in this task.
- Analytics uses basic opt-in: no gtag download or queued events without a valid local choice. Refusal, malformed/expired choices, unavailable storage and classroom mode fail closed. Footer controls allow withdrawal, clear accessible GA cookies and reload to unload the runtime. Other-tab changes reload. Google Signals and ad-personalization signals are disabled. Internal/developer traffic classification remains independent of consent.
- Classroom mode persists until explicitly changed, even if Analytics consent expires. It blocks blog Auto ads, in-article requests, Analytics and the email form. The printable resources stay available without signup. This is a shared-device safeguard, not age verification or verified parental consent.
- Email input is offered only after an adult self-declaration; the subscribe API rejects requests missing the declaration. No age/DOB is stored. Existing seven-day signed confirmation links and retry/unsubscribe flows remain functional. Removed the occasional-notes/newsletter promise.

## Database and scheduled cleanup

Migration `20261027030000_expire-email-delivery-records.sql` retains only id, email and created_at in email_signups. It removes the unnecessary saint/geography columns. The same server-only RPC signature remains compatible with the deployed email route; its saint argument is no longer persisted. Valid retries neither duplicate nor extend records. Older than seven days is expired. A later confirmed request can create another record, so generate_lead is a confirmed-request event, not a lifetime unique-person count.

The administrator-only, parameterless `prune_expired_email_data()` removes expired email rows and send reservations older than 24 hours. Anonymous/authenticated roles have no execute rights. The rolling send budget and its locks/ceilings are unchanged. A rollback-only database rehearsal tested valid retry preservation, expiry boundaries, removal of unnecessary columns and permissions; it left no fixtures. The applied cleanup reduced 281 address records to 16, with zero expired rows remaining (265 expired records deleted).

InsForge schedule `bd93d9a3-b8a3-48a8-b8a2-127b1fc683b9`, **Saint Discovery email retention**, calls the RPC with an existing `API_KEY` secret reference. No key was read or printed. One actual scheduled execution returned HTTP 200 at 2026-10-27 02:10 UTC. It was then set to daily `0 6 * * *` (UTC); next run verified as October 27 at 06:00 UTC. Thus the published policy promises removal within eight days for delivery records and within 48 hours for send hashes in normal operation. This backend cleanup does not depend on Codex being awake. Provider logs, backups, and recipient inbox copies are separate; their erasure is not implied by deleting application rows. After secret rotation, refresh the schedule's secret reference, because InsForge resolves references when saving a schedule.

## AdSense verification

Publisher pub-6122544703023536 verified in signed-in UI. Saint Discovery's European regulations message was published, English plus 31 languages, but Do not consent was off. After explicit user approval it was enabled for every listed EEA region, Switzerland and the UK, published, and reopened to verify it remained On. Other sites and ad suitability settings were not changed. Google says message changes may take up to an hour to propagate.

Account-level checks: maximize message coverage enabled; consent mode for advertising purposes disabled; special feature 2 disabled. Existing legitimate-interest defaults and optimization remained unchanged. These settings are shared with other sites and were not silently changed. Google's separate CMP handles advertising; the local Analytics preference is not a TCF CMP. The site adds the documented Google callback-based EU advertising revocation button when the CMP reports GDPR applies. US-state default opt-out links must remain intact.

Live official GDPR preview (`/blog?fc=alwaysshow&fctype=gdpr`) displayed Consent, Do not consent and Manage options. Clicking Do not consent dismissed it; Google's Privacy and cookie settings button reopened it. Screenshot evidence is saved locally in output/privacy-retention/. This verifies the live integration in Google's preview mode, not geolocation-based delivery from every European country or a network-level audit of all advertising partners.

US-state coverage gap: the only published US-state message in this publisher account covers cueious.net, not saintdiscoveryquiz.com. No Saint Discovery US-state message was present. This review did not create one or alter the unrelated site's message. Applicability and the appropriate state coverage need review before publishing a separate message; the European-message approval does not establish US compliance.

## Children's-data assessment and outstanding decisions

The teachers page expressly describes middle-school, high-school and adaptations for younger learners. Confirmation resources and a quiz can attract children. These are material audience signals; a generic under-13 disclaimer cannot resolve whether the service or part of it is child-directed or mixed-audience. No age demographics, parental-consent evidence or verified age system were available for this review. Adult self-declaration is not a COPPA compliance determination.

Review with qualified children's-privacy counsel before inviting under-13 online use: intended/actual audience by surface, school deployments, third-party collection from IPs/identifiers, images loaded from external origins, translation, hosting logs and backup/provider deletion practices. Decide whether to keep an adult/teen service with offline materials for younger pupils or build a properly designed child/mixed-audience experience. School use does not automatically authorize commercial tracking. Do not use the new adult button as a substitute for this decision. No verified parental-consent program was implemented or claimed. Parents can use the contact route to request investigation/deletion.

## Validation

42 focused Analytics, email and ad tests passed, including refusal/expiry/malformed storage, cross-tab withdrawal, browser restoration, GA cookie cleanup, classroom ad suppression and adult email declaration. The broader suite passed 189/191 in the restricted sandbox; the two network-dependent failures and the related third blog test passed on an authorized network-enabled rerun. ESLint passed for the changed consent/email/ads modules. Database assertions were rehearsed transactionally before applying the migration; no test messages were sent.

## References

- Google consent implementation: https://developers.google.com/tag-platform/security/guides/consent
- Google publisher CMP requirements: https://support.google.com/adsense/answer/13554116
- Google CMP callbacks, revocation and official preview parameters: https://developers.google.com/funding-choices/fc-api-docs
- FTC COPPA FAQ (notes the April 2025 amendment): https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- FTC data minimization: https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business

This documents implementation evidence and unresolved decisions, not legal certification. Test consent clicks are verification traffic, not audience performance.
