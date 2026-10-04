# Directory editorial maintenance

The public evidence notes and dated corrections log began October 3, 2026. The initial structural inventory contained 625 distinct published biographies plus 16 alias references; its original 641 total was corrected to exclude those aliases. Targeted reading covered Mary Magdalene, Christopher, George, and John Paul II. Neither a structural check nor an HTTP success verifies every historical claim.

## Checking a biography

Read the effective biography, context contribution, calendar qualifications, and reading-guide questions together. Inspect the cited passage, not just the institution's name or an HTTP status. Prefer primary documents and current liturgical authorities for the claims they actually establish. Older reference works are useful historical sources but should not silently override current calendars or supply certainty about a later legend.

Record a claim, its source and relevant passage, evidence category (biblical account, documented history, later tradition, interpretation, or unresolved), and the precise limit of that evidence. If a detail cannot be established, qualify or remove it rather than replacing it with plausible detail. Keep prayers and educational reflection distinct from historical testimony. Do not add words to meet a length threshold when evidence is sparse.

For calendar differences, identify date, calendar system, edition, jurisdiction, and rank. A Vatican News saint listing is not equivalent to inclusion in the General Roman Calendar. Consult the relevant approved calendar and retain recurring biography dates separately from observances assigned in a particular year.

## Recording a completed change

Use `lib/data/directory-evidence-notes.json` for focused, source-linked evidence explanations. Add a dated entry to `lib/data/directory-corrections.json` for substantive corrections or clarifications, including the actual previous presentation, the resulting change, method, and supporting sources. Do not invent a prior error, backdate a correction, or mark an investigated report resolved before editing the affected content. Recheck all related sections when changing a factual claim.

Maintain the biography, contribution, and evidence-note dates independently. The shared revision-date helper chooses the latest date for Article structured data and sitemap entries. Do not substitute build time for a content revision. If the corrections log changes, update its sitemap date to the latest actual entry.

## Qualified human review

No qualified human review was performed or credited during this implementation. Public credits require a completed review and permission to publish the reviewer's identity. Keep a private review record containing:

- The reviewer's name, relevant qualification and how that qualification was verified.
- Exact page URLs, passages, and the archived content version or commit examined.
- Scope: historical research, Catholic theology, liturgical calendars, or educational suitability.
- Date completed, findings, corrections accepted, and unresolved disagreements.
- The reviewer's confirmation of the final wording and permission to publish the credit.

Publish the name, relevant qualification, date, scope, and reviewed version only after completion. Review of selected pages does not imply approval of the whole directory. Later substantive revisions need renewed review or an explicit notice that the credit applies to the earlier version. Do not turn a volunteer review, a priest's title, or an institutional email address into a claim of ecclesiastical approval. Imprimatur and diocesan endorsement require their own documented authorization.

Prioritize sparse early lives, legends used in classroom materials, calendar disagreements, similar-name identities, and records relying solely on old reference works. Invite specialist review through hello@saintdiscoveryquiz.com; do not imply a reviewer has accepted an invitation before they respond.

## Validation

Run `node scripts/audit-biographies.mjs --require-complete`, `npm run directory:check`, and the biography, contribution, editorial, calendar, and SEO tests. The first audit covers the legacy inventory; directory:check and the credibility audit also include later additions. Use `node scripts/audit-directory-credibility.mjs` to generate the full source inventory and targeted link-check record under research/directory-credibility/2026-10-03. Network failures require investigation; a failed fetch alone is not proof that a reference is false or permanently broken.
