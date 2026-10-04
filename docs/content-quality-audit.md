# Content quality audit

Baseline captured **2026-10-04**, before this improvement pass's content edits. These are editorial triage measurements, not Google's word-count requirements, a quality score, proof of historical accuracy, or a prediction of AdSense approval.

## Repeatable local check

Run from the repository root after installing the existing development dependencies:

```sh
node scripts/content-quality-audit.mjs
```

The command reads the actual published catalog using `getAllSaints`, `getBiographyReview`, `getSaintContribution`, and `getSaintLearningGuide`. It prints JSON to stdout; it makes no network requests, writes no files, and changes neither content nor review dates. Redirect stdout to a local file when a saved comparison is useful. The existing TypeScript test loader resolves the same merged data imports that public pages use, so the audit does not mistake archived records or overridden text for published content.

The report includes per-profile word/source counts and guide coverage, repeated text with section/paragraph/sentence locations, and source-host URL reference counts. Each source URL counts once per profile across the inspected sections; multiple URLs from the same host remain separate references. A source count does not establish independence or support for every claim.

## Starting measurements

| Measure | Baseline |
| --- | ---: |
| Published canonical records | 487 |
| Missing biography reviews | 0 |
| Biographies under 150 words | 61 |
| Biographies 150–299 words | 396 |
| Biographies 300–599 words | 30 |
| Biographies 600+ words | 0 |
| Biography + contribution under 150 words | 61 |
| Biography + contribution 150–299 words | 194 |
| Biography + contribution 300–599 words | 232 |
| Biography + contribution 600+ words | 0 |
| Profiles with a contribution section | 426 |
| Profiles with a tailored learning guide | 4 |
| Biographies with 1 / 2 / 3 / 4 distinct source URLs | 255 / 191 / 38 / 3 |
| Unspecified feast dates | 65 |
| Exact repeated paragraph groups, at least 12 words | 0 |
| Exact repeated sentence groups, at least 12 words | 0 |
| Within-profile similar sentence candidates at the configured threshold | 0 |

The 61 short biographies are the recent directory additions; none has a contribution section at baseline. Their concise format is explicit, and unverified feast dates must remain unspecified until an appropriate calendar source is checked. A short source-supported account can be more useful than padded prose. Record totals can include saint groups and should not be advertised as an audited count of individual people.

The four tailored guides cover Augustine of Hippo, Hildegard of Bingen, Teresa of Ávila, and Thérèse of Lisieux. The principal measurable gap is that most profiles lack a tailored next step for learning, even where a contribution section already adds context. Source concentration also warrants review: 255 biographies cite only one distinct URL. Adding a second URL is useful only when it supplies missing evidence or a different useful perspective.

## Repetition methodology and limits

The audit checks biography and contribution paragraphs, with case, punctuation and Unicode normalization. It uses Node's English sentence segmentation and ignores units shorter than 12 words. Nonidentical sentences within one profile are flagged when their token-set Jaccard overlap is at least 0.75. Exact matches are reported separately. Relevant shared historical context is not automatically a defect.

No matches at these thresholds means no such matches were detected in these sections. It does **not** certify originality or eliminate repetitive ideas, formulaic framing, unsupported interpretation, repetition in other UI sections, or duplication with outside websites. Human reading remains necessary. Length excludes titles, prayers, reflection prompts and learning exercises; the audit never treats generated navigation or boilerplate as historical depth. Source links are counted, not fetched or fact-checked.

## Remaining directory-wide editorial work

1. Start with quiz-result profiles and the 61 concise additions. Identify the reader's unanswered question, then consult the cited institutional/reference source before adding an original factual paragraph or a specific reading task. Preserve uncertainty and avoid padding to a target length.
2. On a profile-by-profile basis, compare biography and contribution sections for repeated ideas and unsupported interpretation. Merge redundant explanations while preserving the useful distinction between history and suggested personal reflection.
3. Check whether each source actually supports names, dates, Catholic recognition, feast scope and important historical claims. Older reference works and non-Catholic historical sources can aid research, but do not by themselves establish current Catholic liturgical recognition. Keep historical tradition and documented evidence distinguishable.
4. Expand tailored learning paths where evidence permits: a named reading, an explained starting passage, a factual question answered with a citation, and a practical reflection clearly identified as the site's exercise. Do not imply every profile has received that level of work.
5. Record substantive reviews honestly. A passing audit or unchanged rebuild is not a new editorial review. Re-run this command after content batches and retain the actual before/after numbers with the release's manual source checks.

This baseline does not certify all 487 biographies or resolve the 65 unspecified feast dates. Any completed batch should list its actual profiles and checked sources separately from this ongoing backlog.
