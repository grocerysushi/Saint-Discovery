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
Work therefore preserves that live version. The user subsequently authorized
production releases, but the release path needs resolution without discarding
live changes or implicitly merging the existing PR.

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
