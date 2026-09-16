import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = path.join(root, 'lib/data');
const args = new Set(process.argv.slice(2));
for (const arg of args) if (!['--require-complete', '--write-report'].includes(arg)) throw new Error(`Unknown option: ${arg}`);
const errors = [];
const text = v => typeof v === 'string' && v.trim().length > 0;
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const nullable = v => v === null || text(v);
const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

// JSON.parse silently discards duplicate keys; inspect root keys first.
function rootKeys(raw) {
  const keys = [];
  let depth = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '"') {
      const start = i;
      for (i++; i < raw.length; i++) {
        if (raw[i] === '\\') i++;
        else if (raw[i] === '"') break;
      }
      let next = i + 1;
      while (next < raw.length && /\s/.test(raw[next])) next++;
      if (depth === 1 && raw[next] === ':') keys.push(JSON.parse(raw.slice(start, i + 1)));
    } else if (raw[i] === '{' || raw[i] === '[') depth++;
    else if (raw[i] === '}' || raw[i] === ']') depth--;
  }
  return keys;
}

const saints = JSON.parse(await readFile(path.join(dataDir, 'saints.json'), 'utf8'));
if (!Array.isArray(saints)) throw new Error('saints.json must be an array');
const slugs = new Set();
for (const saint of saints) {
  if (!text(saint.slug)) errors.push('Raw saint has no nonempty slug');
  else if (slugs.has(saint.slug)) errors.push(`Repeated raw slug: ${saint.slug}`);
  else slugs.add(saint.slug);
}
if (saints.length !== 486) errors.push(`Expected 486 raw records; found ${saints.length}`);
const files = (await readdir(dataDir)).filter(f => /^saint-reviews.*\.json$/.test(f)).sort();
const reviews = new Map();
for (const file of files) {
  try {
    const raw = (await readFile(path.join(dataDir, file), 'utf8')).replace(/^\uFEFF/, '');
    const parsed = JSON.parse(raw);
    if (!object(parsed)) throw new Error('root must be an object keyed by slug');
    const keys = new Set();
    for (const slug of rootKeys(raw)) {
      if (keys.has(slug)) errors.push(`${file}: repeated JSON key ${slug}`);
      keys.add(slug);
    }
    for (const [slug, review] of Object.entries(parsed)) {
      if (!slugs.has(slug)) errors.push(`${file}: extra slug ${slug}`);
      if (reviews.has(slug)) errors.push(`${slug}: collision between ${reviews.get(slug).file} and ${file}`);
      else reviews.set(slug, { review, file });
    }
  } catch (error) { errors.push(`${file}: ${error.message}`); }
}

const counts = {};
for (const [slug, { review: r, file }] of reviews) {
  const fail = message => errors.push(`${file} / ${slug}: ${message}`);
  if (!object(r)) { fail('review must be an object'); continue; }
  counts[r.status] = (counts[r.status] ?? 0) + 1;
  if (!['source-reviewed', 'duplicate', 'needs-identification'].includes(r.status)) fail('invalid status');
  if (!date(r.reviewed_on)) fail('reviewed_on must be a valid ISO date');
  if (r.status === 'duplicate') {
    if (!text(r.reason)) fail('duplicate requires a reason');
    if (!text(r.canonical_slug) || !slugs.has(r.canonical_slug)) fail('canonical slug must exist in raw data');
    if (r.canonical_slug === slug) fail('duplicate points to itself');
    if (reviews.get(r.canonical_slug)?.review?.status !== 'source-reviewed') fail('target must be source-reviewed: no alias chains or unresolved targets');
    continue;
  }
  if (!text(r.name) || !text(r.review_method)) fail('name and review_method must be nonempty');
  const kinds = r.status === 'needs-identification' ? ['unresolved'] : ['saint', 'blessed', 'orthodox-saint', 'observance'];
  if (!kinds.includes(r.kind)) fail('kind incompatible with status');
  for (const key of ['feast_day', 'origin', 'dates', 'patron_of', 'prayer', 'fun_fact']) if (!nullable(r[key])) fail(`${key} must be nonempty text or null`);
  if (typeof r.feast_note !== 'string') fail('feast_note must be a string');
  if (!Array.isArray(r.biography) || r.biography.length < 2 || !r.biography.every(text)) fail('biography requires two or more nonempty paragraphs');
  if (!Array.isArray(r.quotes) || !r.quotes.every(text)) fail('quotes must be an array of nonempty strings');
  if (!Array.isArray(r.sources) || !r.sources.length) fail('sources must be a nonempty array');
  else for (const source of r.sources) {
    if (!object(source) || !text(source.title)) fail('source requires a title');
    try {
      const url = new URL(source?.url);
      if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) throw new Error();
    } catch { fail(`source must have a valid HTTPS URL: ${source?.url}`); }
  }
  if (r.status === 'needs-identification') for (const key of ['feast_day', 'origin', 'dates', 'patron_of']) if (r[key] !== null) fail(`unresolved identity must not assert ${key}`);
}
const pending = [...slugs].filter(s => !reviews.has(s)).sort();
const expansionFiles = (await readdir(dataDir)).filter(f => /^saint-biography-expansions-\d+\.json$/.test(f)).sort();
const expansions = new Map();
const words = paragraphs => paragraphs.join(' ').trim().split(/\s+/u).length;
for (const file of expansionFiles) {
  try {
    const raw = await readFile(path.join(dataDir, file), 'utf8');
    const parsed = JSON.parse(raw);
    if (!object(parsed)) throw new Error('root must be an object keyed by slug');
    const keys = rootKeys(raw);
    if (new Set(keys).size !== keys.length) errors.push(`${file}: repeated JSON keys`);
    for (const [slug, expansion] of Object.entries(parsed)) {
      const fail = message => errors.push(`${file} / ${slug}: ${message}`);
      const base = reviews.get(slug)?.review;
      if (base?.status !== 'source-reviewed') fail('requires a source-reviewed canonical identity');
      if (expansions.has(slug)) fail('duplicate expansion');
      expansions.set(slug, expansion);
      if (!object(expansion)) { fail('expansion must be an object'); continue; }
      if (Object.keys(expansion).some(key => !['biography', 'sources', 'reviewed_on', 'review_method'].includes(key))) fail('unexpected field: expansions must not change identity metadata');
      if (!date(expansion.reviewed_on) || !text(expansion.review_method)) fail('requires valid review date and method');
      if (!Array.isArray(expansion.biography) || expansion.biography.length < 4 || !expansion.biography.every(text)) fail('requires at least four nonempty paragraphs');
      else if (base?.biography && words(expansion.biography) < words(base.biography) + 50) fail('requires at least 50 additional words of biography');
      if (!Array.isArray(expansion.sources) || !expansion.sources.length) fail('sources must be a nonempty array');
      else for (const source of expansion.sources) {
        if (!object(source) || !text(source.title)) fail('source requires a title');
        try {
          const url = new URL(source?.url);
          if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) throw new Error();
        } catch { fail(`source must have a valid HTTPS URL: ${source?.url}`); }
      }
    }
  } catch (error) { errors.push(`${file}: ${error.message}`); }
}
const unexpanded = [...reviews].filter(([slug, { review }]) => review.status === 'source-reviewed' && !expansions.has(slug));
if (args.has('--require-complete') && unexpanded.length) errors.push(`${unexpanded.length} published biographies still lack expansions`);
const unresolved = [...reviews].filter(([, v]) => v.review?.status === 'needs-identification').sort();
const aliases = [...reviews].filter(([, v]) => v.review?.status === 'duplicate').sort();
console.log(`Raw records: ${saints.length}; unique slugs: ${slugs.size}`);
console.log(`Review files: ${files.length}; unique review records: ${reviews.size}`);
console.log(`Expanded biographies: ${expansions.size}; expansion files: ${expansionFiles.length}; remaining: ${unexpanded.length}`);
for (const status of ['source-reviewed', 'duplicate', 'needs-identification']) console.log(`${status}: ${counts[status] ?? 0}`);
console.log(`Pending (${pending.length}): ${pending.join(', ') || 'none'}`);
console.log(`Unresolved (${unresolved.length}): ${unresolved.map(([s]) => s).join(', ') || 'none'}`);
if (args.has('--require-complete') && pending.length) errors.push(`${pending.length} raw records still lack reviews`);
for (const error of errors) console.error(`ERROR: ${error}`);
console.log(`Audit: ${errors.length ? `FAILED (${errors.length} errors)` : 'PASSED'}`);

if (args.has('--write-report')) {
  const esc = v => String(v).replaceAll('|', '\\|').replaceAll('\n', ' ');
  const lines = [
    '# Biography source review', '',
    `Generated from checked-in data on ${new Date().toISOString().slice(0, 10)}.`, '',
    'This is AI-assisted comparison with cited external sources, not ecclesiastical approval, scholarly peer review, or a guarantee that every historical question is settled. Source-reviewed means a source comparison was performed; legends and private revelations were not independently proven.', '',
    '## Method and limits', '',
    'Reviewers independently consulted external material for assigned identities, preferring Holy See and Vatican publications, dioceses, religious orders, the French bishops’ Nominis calendar, the Catholic Encyclopedia, and Orthodox church sources where appropriate. Older works can be dated, and institutional sources sometimes disagree. Biographies distinguish biblical narrative, devotional tradition, and later legend from securely established history where material.', '',
    'The review compared identity, names, saint/blessed status, feast dates and calendar variants, origin, dates, and retained patronage. Unsupported quotations, attributed prayers, fun facts, and patronages were cleared rather than carried forward. Source links support the associated review, not every claim on the linked page.', '',
    'The original saints.json and saint-extended.json are legacy inputs, not independent factual authorities. The former supplies the 486-slug inventory. Review overlays provide corrected biographies and explicit duplicate or unresolved classifications. The deprecated model-only generator must not overwrite these reviews.', '',
    '## Reproduce the audit', '', '```sh',
    'node scripts/audit-biographies.mjs',
    'node scripts/audit-biographies.mjs --require-complete',
    'node scripts/audit-biographies.mjs --require-complete --write-report', '```', '',
    'The audit reads every lib/data/saint-reviews*.json and saint-biography-expansions-*.json file. It checks the raw inventory, repeated JSON keys, cross-file collisions, extra slugs, schema, nonempty biography paragraphs, HTTPS source URLs, and direct canonical duplicate targets. Expansion files may update biography and review provenance only; they require four paragraphs and at least 50 additional words. --require-complete fails for missing reviews or missing expansions of published identities. Explicitly unresolved identities count as completed research dispositions, not verified saints. This structural audit does not fetch sources or automatically verify historical claims.', '',
    '## Current coverage', '', '| Measure | Count |', '| --- | ---: |',
    `| Raw records | ${saints.length} |`, `| Review files | ${files.length} |`,
    `| Source-reviewed | ${counts['source-reviewed'] ?? 0} |`, `| Duplicate redirects | ${aliases.length} |`,
    `| Expanded published biographies | ${expansions.size} |`, `| Published biographies awaiting expansion | ${unexpanded.length} |`,
    `| Needs identification | ${unresolved.length} |`, `| Pending | ${pending.length} |`, `| Audit errors | ${errors.length} |`, '',
    `Review files: ${files.map(f => '`' + f + '`').join(', ')}.`, '',
    '## Unresolved identities', '',
    'These records must remain visibly unresolved and be excluded from recommendations implying a confirmed saint identity. Their sources support disambiguation, not proof of nonexistence.', '',
    ...unresolved.flatMap(([slug, { review: r }]) => [
      `### ${r.name} (${slug})`, '',
      ...(Array.isArray(r.biography) ? r.biography.flatMap(p => [p, '']) : []),
      ...(Array.isArray(r.sources) ? r.sources.map(s => `- [${s.title}](${s.url})`) : []), '',
    ]),
    ...(unresolved.length ? [] : ['None.', '']),
    '## Duplicate aliases', '', '| Alias | Canonical record | Reason |', '| --- | --- | --- |',
    ...aliases.map(([s, { review: r }]) => `| ${esc(s)} | ${esc(r.canonical_slug)} | ${esc(r.reason)} |`), '',
    '## Pending records', '', pending.join(', ') || 'None.', '',
    '## Validation findings', '', ...(errors.length ? errors.map(e => `- ${e}`) : ['No structural errors found.']), '',
    '## Maintenance', '',
    'For additions and corrections, inspect external sources, write original prose, explain material uncertainty, and retain calendar qualifications. Keep exactly one review per slug. Direct aliases to source-reviewed canonical records without chains. Re-run the audit and regenerate this report after dataset changes. Human subject-matter review remains valuable, especially for sparse early lives, disputed identities, and local calendars.', '',
  ];
  await writeFile(path.join(root, 'research/BIOGRAPHY-REVIEW.md'), lines.join('\n'));
  console.log('Updated research/BIOGRAPHY-REVIEW.md');
}
if (errors.length) process.exitCode = 1;
