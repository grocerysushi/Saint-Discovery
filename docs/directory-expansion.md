# Verified directory expansion

## Baseline and publication boundary

Inspected 2026-10-01 at main commit `6f95c3462bc128fe26432fa4500276330298dcf0`.
The current project is grocerysushi/Saint-Discovery (Next.js 16 / React 19),
not the older Saint-Discovery-Quiz Express application.

`lib/data/saints.json` contains 486 legacy records generated from seed.sql and
saints-data.csv by scripts/build-data.mjs. Five saint-reviews JSON files
classify them: 460 reviewed canonical records, 16 aliases, 10 unresolved.
The reviewed total comprises 423 Catholic saint records, 11 blesseds,
18 Orthodox saints, and 8 observances. This is a record count, not an audited
count of individual human saints (the legacy collection includes groups).
Four biography-expansion overlays provide existing longer biographies.
lib/saints.ts applies reviews; app/saints/[slug]/page.tsx generates pages,
source links and citation structured data. The sitemap uses the same catalog.
Quiz matching uses separate quiz-saints.json and must remain unchanged.
InsForge handles other site features; expanding this static directory requires
no live database writes or SQL migration.

The clean checkout has no tracked GitHub workflows or Vercel configuration.
Vercel project saint-discovery-ulzh in kyles-projects-8f9ed4d4 has main configured
as its production branch. However, inspection of the live domain aliases and
GitHub production deployments identifies hide-ad-placeholders commit 5d78412
as the actual production source. It is six commits ahead of main in open PR #7.
Work preserves that live version. The user explicitly approved bringing the six
already-live commits into main together with tested updates. Cleanup commit
35b2533 was pushed as a normal fast-forward to main on 2026-10-01.

## Catholic-only cleanup

34 previously published records are excluded reversibly: all 11 blesseds,
all 8 observances, and 15 Orthodox-labeled records lacking established Catholic
recognition in this review. The archival JSON, images and review history remain.
Ten already-unresolved identities are also unavailable as public biographies.
Old URLs return the site's ordinary 404, not a redirect to another person.
Directory, sitemap, daily selections, quiz scoring and patron-topic links apply
the Catholic-only policy. Legacy quiz scores themselves are unchanged.

Three previously Orthodox-labeled records are retained with sourced recognition
overlays in catholic-recognition.json: Gleb (UGCC liturgical celebration),
Gregory Palamas (Melkite Catholic commemoration), and Sergius of Radonezh
(Catholic Online reference coverage corroborated by CNEWA). Thus the baseline
becomes 426 Catholic saint records. Sergius has reference-level evidence here,
not a newly asserted papal canonization. No conclusion that an excluded person
can never have Catholic recognition follows from lack of evidence in this pass.
Aetherius is not silently conflated with the different Catholic bishop of Lyon.

## Expansion policy

Add named individuals only after checking a Catholic institutional biography
or primary recognition source. Store original concise prose, source URLs,
review date, evidence notes, stable identity key and alternate names.
Never manufacture a birth year, patronage, quotation, personality score, or
universal feast from a date of death. A calendar citation must state scope;
otherwise leave the feast unknown and explain that limitation visibly.
Separate saints, blesseds, Orthodox saints, groups and observances. Search
aliases before insertion; uncertain matches need review, not a second page.
Do not copy source biographies or illustrations. Discovery lists and Wikidata
can help identify candidates but are not sufficient recognition evidence.

Next coverage priorities: individually documented women and lay saints,
Korean, Vietnamese and Chinese martyrs, African saints, and regional calendars.
Group totals are candidate pools, never automatic increments to public counts.
Do not count a cohort once and then claim its members as additional people.

## Repeatable local workflow

1. Read an individual institutional biography and record its stable source URL,
   recognition evidence and reviewed date. Compare name, aliases, dates and
   biography against legacy and new records; transliteration alone is not identity.
2. Add an array entry to research/directory-batches/YYYY-MM-DD-topic.json.
   Follow the first batch schema. All prose must be original and factual.
   Source access and factual review are editorial steps, not claims made by the
   validator. Add citations for each new assertion; do not pad sparse lives.
3. Run `npm run directory:build` then `npm run directory:check`. The deterministic
   compiler rejects identity/alias collisions, duplicate institutional identity
   keys, non-saints, groups, short placeholders and dates without scoped citations.
   It writes only lib/data/directory-additions.json and never contacts a database.
4. Run `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
   `npm run test:seo`. Inspect biographies, links and counts before releasing.
   Confirm the production commit, canonical sitemap and old excluded URLs after
   pushing main; do not treat a Git push as proof of successful deployment.

The first batch contains 21 individually documented Jesuit saints and lay
collaborators, with 21 distinct individual source URLs and original summaries.
They bring the Catholic-only directory from 426 to 447 records; all 21 are new
individuals, not aliases, groups or reclassifications. This is a deliberately
limited first batch, predominantly European men; it does not complete the
regional and gender coverage goals above. Each biography is about 65–120 words.
The institutional source is the Society of Jesus, a Catholic religious order.

All 21 calendar dates are explicitly unverified (null); no date-of-death field
was repurposed as a feast. Pignatelli, de Brito and de la Lande have inconsistent
day/month metadata in their sources, while Goupil's source has inconsistent
geography. Those details are withheld or qualified in the original summaries.
No full biographies, source images, patronages, prayers or quotations are copied.

New entries use stable directory IDs and directory_only=true. Six numeric zeros
exist solely to satisfy the legacy Saint interface, never as researched trait
ratings. Scoring, shared quiz results and trait-based related ranking explicitly
exclude these records. The quiz dataset and its established scores are unchanged;
the earlier Catholic-only cleanup is the only eligibility reduction.
Legacy seed regeneration cannot erase this separate directory overlay.
