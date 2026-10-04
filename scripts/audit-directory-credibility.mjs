import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTs } from '../tests/load-ts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const { reviews, isPublishedSaintSlug, getBiographyReview, canonicalSaintSlug } = loadTs('lib/saint-reviews.ts');
const { getSaintContribution } = loadTs('lib/saint-contributions.ts');
const { directoryEvidenceNotes, getBiographyUpdatedOn } = loadTs('lib/directory-editorial.ts');
const slugs = Object.keys(reviews).filter(slug => canonicalSaintSlug(slug) === slug && isPublishedSaintSlug(slug)).sort();
const errors = [];
const inventory = slugs.map(slug => {
  const review = getBiographyReview(slug);
  const contribution = getSaintContribution(slug);
  const note = directoryEvidenceNotes[slug];
  const sources = [...review.sources, ...(contribution?.sources ?? []), ...(note?.history.sources ?? []), ...(note?.calendar.sources ?? [])];
  if (!sources.length) errors.push(`${slug}: missing sources`);
  for (const source of sources) {
    try {
      const url = new URL(source.url);
      if (url.protocol !== 'https:' || url.username || url.password || !source.title.trim()) throw new Error();
    } catch { errors.push(`${slug}: invalid source reference`); }
  }
  return { slug, name: review.name, biographyReviewedOn: review.reviewed_on,
    contributionReviewedOn: contribution?.reviewed_on ?? null,
    evidenceNoteReviewedOn: note?.reviewed_on ?? null,
    updatedOn: getBiographyUpdatedOn(slug), feastDate: review.feast_day,
    feastQualification: review.feast_note, reviewMethod: review.review_method,
    sources: [...new Map(sources.map(source => [source.url, source])).values()] };
});

// Structural inventory is directory-wide. HTTP checks are deliberately scoped
// to the four biographies read during this pass, including their existing sources.
const selected = new Set(Object.keys(directoryEvidenceNotes));
const targets = [...new Set(inventory.filter(entry => selected.has(entry.slug)).flatMap(entry => entry.sources.map(source => source.url)))];
const linkChecks = [];
let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < targets.length) {
    const url = targets[next++];
    const checkedAt = new Date().toISOString();
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'SaintDiscovery-EditorialSourceAudit/1.0 (+https://www.saintdiscoveryquiz.com/editorial-policy)' }, signal: AbortSignal.timeout(20000) });
      const contentType = response.headers.get('content-type');
      // HTTP success is only a link check, never a historical review outcome.
      linkChecks.push({ url, checkedAt, status: response.status, finalUrl: response.url,
        contentType, result: response.ok ? 'retrievable — content not automatically verified' : 'retrieval requires investigation' });
      await response.body?.cancel();
    } catch (error) {
      linkChecks.push({ url, checkedAt, status: null, result: 'retrieval unavailable', error: error.message });
    }
  }
}));

const out = path.join(root, 'research/directory-credibility/2026-10-03');
await fs.mkdir(out, { recursive: true });
const report = { auditDate: '2026-10-03', checkedAt: new Date().toISOString(),
  method: 'AI-assisted structural source inventory for published biographies; targeted HTTP checks and separately recorded primary-source reading. Not qualified human review.',
  publishedBiographies: inventory.length, structurallyInvalidReferences: errors,
  uniqueSourceUrls: new Set(inventory.flatMap(entry => entry.sources.map(source => source.url))).size,
  targetedBiographies: [...selected], linkChecks: linkChecks.sort((a, b) => a.url.localeCompare(b.url)),
  limitation: 'Most biography sources were inventoried, not fetched or reread in this pass. HTTP status alone does not establish historical reliability.',
  inventory };
await fs.writeFile(path.join(out, 'source-inventory.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ publishedBiographies: inventory.length, uniqueSourceUrls: report.uniqueSourceUrls,
  structuralErrors: errors.length, targetedLinkChecks: linkChecks.length,
  retrievalIssues: linkChecks.filter(check => check.status === null || check.status >= 400).map(({ url, status }) => ({ url, status })),
  report: 'research/directory-credibility/2026-10-03/source-inventory.json' }, null, 2));
if (errors.length) process.exitCode = 1;
