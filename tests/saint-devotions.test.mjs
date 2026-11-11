// QA for template version 2 saint pages (lib/data/saint-devotions.json).
// Run alone with: node --test tests/saint-devotions.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const devotions = JSON.parse(fs.readFileSync(new URL('../lib/data/saint-devotions.json', import.meta.url), 'utf8'));
const { getAllSaints, getSaintBySlug } = loadTs('lib/saints.ts');
const { getTopicBySlug } = loadTs('lib/patronage.ts');
const { saintSearchSummary } = loadTs('lib/saint-seo.ts');

const words = text => (text ?? '').trim().split(/\s+/).filter(Boolean).length;
const blank = value => typeof value === 'string' && /^\s*(n\/?a|none|tbd|unknown)?\s*$/i.test(value);
// Abbreviations like "St." do not end a sentence.
const firstSentence = text => (text.replace(/\b(St|Sts|Mt|Fr|Dr)\./g, '$1').match(/^.*?[.!?](\s|$)/) ?? [text])[0];

function problems(slug, entry, publishedSlugs) {
  const issues = [];
  const need = (ok, message) => { if (!ok) issues.push(message); };
  need(entry.templateVersion === 2 || entry.templateVersion === 1.5, 'templateVersion must be 2 or 1.5');
  need(publishedSlugs.has(slug), 'slug is not a published saint page');

  // Shape checks apply to whatever is filled in, for both 2 and 1.5.
  for (const [key, value] of Object.entries(entry)) {
    if (blank(value)) issues.push(`${key} is blank or "n/a"`);
  }
  if (entry.searchDescription) need(entry.searchDescription.length <= 160 && /[.!?]$/.test(entry.searchDescription), 'searchDescription must be a complete sentence of 160 characters or fewer');
  if (entry.heroSummary) need(words(entry.heroSummary) >= 40 && words(entry.heroSummary) <= 60, `heroSummary is ${words(entry.heroSummary)} words (40–60)`);
  if (entry.whyWeTurn) need(words(entry.whyWeTurn) >= 80 && words(entry.whyWeTurn) <= 120, `whyWeTurn is ${words(entry.whyWeTurn)} words (80–120)`);
  if (entry.confirmationNote) need(words(entry.confirmationNote) >= 50 && words(entry.confirmationNote) <= 80, `confirmationNote is ${words(entry.confirmationNote)} words (50–80)`);
  for (const topic of entry.patronages ?? []) need(Boolean(getTopicBySlug(topic)), `patronage "${topic}" is not a live /patron-saint-of topic`);
  if (entry.patronages?.length && entry.heroSummary) need(/patron/i.test(firstSentence(entry.heroSummary)), 'heroSummary first sentence must name the patronage');
  // 1.5 entries keep the old layout, so a short symbol list is stored for review, not rendered.
  if (entry.symbols && entry.templateVersion === 2) need(entry.symbols.length >= 3 && entry.symbols.length <= 5 && entry.symbols.every(s => s.symbol && s.meaning), 'symbols must be 3–5 complete entries');
  if (entry.quotes) {
    need(entry.quotes.length <= 3, 'at most 3 quotes');
    for (const q of entry.quotes) {
      need(q.text && q.work && q.translation, 'every quote needs text, work and translation');
      need(words(q.text) <= 75, `quote too long (${words(q.text)} words): ${q.work}`);
      need(!/NAB|NABRE|RSV|New American|Revised Standard/i.test(q.translation), `quote uses a copyrighted translation: ${q.translation}`);
    }
  }
  if (entry.prayer) {
    need(entry.prayer.kind === 'traditional' || entry.prayer.kind === 'original', 'prayer.kind must be traditional or original');
    need(Boolean(entry.prayer.source), 'prayer needs a source');
    if (entry.prayer.kind === 'original') {
      need(entry.prayer.source === 'Saint Discovery', 'original prayers use source "Saint Discovery"');
      need(words(entry.prayer.text) >= 60 && words(entry.prayer.text) <= 120, `original prayer is ${words(entry.prayer.text)} words (60–120)`);
    }
  }
  if (entry.feastCustoms) {
    need(entry.feastCustoms.length >= 3 && entry.feastCustoms.length <= 5, 'feastCustoms must have 3–5 items');
    need(!entry.feastCustoms.some(c => /\b\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)\b|\(\d{3}\)|\d{3}-\d{4}/i.test(c)), 'feastCustoms must not include Mass times or phone numbers');
  }
  if (entry.places) {
    need(entry.places.length <= 3, 'at most 3 places');
    for (const p of entry.places) need(p.name && p.city && /^https:\/\//.test(p.url ?? ''), `place needs name, city and https url: ${p.name}`);
  }
  if (entry.reflectionPrompts) need(entry.reflectionPrompts.length >= 3, 'at least 3 reflection prompts');
  if (entry.relatedSaints) {
    need(entry.relatedSaints.length === 4, 'relatedSaints must have 4 entries');
    need(entry.relatedSaints.some(r => r.historical), 'at least one historically related saint (historical: true)');
    for (const r of entry.relatedSaints) {
      need(publishedSlugs.has(r.slug) && r.slug !== slug, `related saint "${r.slug}" does not exist`);
      need(Boolean(r.reason), `related saint "${r.slug}" needs a reason`);
    }
  }

  if (entry.templateVersion === 2) {
    for (const key of ['heroSummary', 'symbols', 'whyWeTurn', 'prayer', 'feastCustoms', 'confirmationNote', 'reflectionPrompts', 'relatedSaints']) {
      const value = entry[key];
      need(Array.isArray(value) ? value.length > 0 : Boolean(value), `v2 requires ${key} (otherwise set templateVersion 1.5)`);
    }
  } else {
    need(Array.isArray(entry.flags) && entry.flags.length > 0, '1.5 entries must list flags explaining the gaps');
  }
  return issues;
}

test('every saint-devotions entry passes v2 QA', async () => {
  const published = new Set((await getAllSaints()).map(s => s.slug));
  const report = Object.entries(devotions)
    .map(([slug, entry]) => [slug, problems(slug, entry, published)])
    .filter(([, issues]) => issues.length > 0);
  assert.deepEqual(report, [], report.map(([slug, issues]) => `${slug}:\n  - ${issues.join('\n  - ')}`).join('\n'));
});

test('v2 pages have a complete search description', async () => {
  for (const [slug, entry] of Object.entries(devotions)) {
    if (entry.templateVersion !== 2) continue;
    const saint = await getSaintBySlug(slug);
    const { description } = saintSearchSummary(saint);
    assert.match(description, /[.!?”"]$/, `${slug}: search description looks cut off: ${description}`);
  }
});

test('1.5 entries are listed in docs/saints-v2-needs-review.md', () => {
  const review = fs.existsSync(new URL('../docs/saints-v2-needs-review.md', import.meta.url))
    ? fs.readFileSync(new URL('../docs/saints-v2-needs-review.md', import.meta.url), 'utf8') : '';
  for (const [slug, entry] of Object.entries(devotions)) {
    if (entry.templateVersion === 1.5) assert.ok(review.includes(slug), `${slug} is 1.5 but not in docs/saints-v2-needs-review.md`);
  }
});
