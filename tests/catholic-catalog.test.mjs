import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

test('Catholic-only policy governs canonical pages, aliases, quiz and patron links', async () => {
  const { reviews, isPublishedSaintSlug, applySaintReview } = loadTs('lib/saint-reviews.ts');
  const { getAllSaints, getSaintBySlug, getAllSaintSlugs } = loadTs('lib/saints.ts');
  const all = await getAllSaints();
  assert.ok(all.every(s => s.kind === 'saint'));
  const removed = Object.keys(reviews).filter(slug => reviews[slug].status === 'source-reviewed' && !isPublishedSaintSlug(slug));
  assert.equal(removed.length, 34);
  for (const slug of removed) {
    assert.equal(await getSaintBySlug(slug), null, slug);
    assert.ok(!getAllSaintSlugs().includes(slug), slug);
  }
  for (const slug of ['gleb', 'gregory-palamas', 'sergius-of-radonezh']) assert.equal((await getSaintBySlug(slug)).kind, 'saint');
  const { rankSaints } = loadTs('lib/scoring.ts');
  const quiz = JSON.parse(fs.readFileSync(new URL('../lib/data/quiz-saints.json', import.meta.url))).map(applySaintReview);
  const scores = Object.fromEntries(['contemplative','charitable','intellectual','courageous','joyful','mystical'].map(k => [k,1]));
  assert.ok(rankSaints(scores, quiz).every(m => isPublishedSaintSlug(m.saint.slug)));
  for (const topic of loadTs('lib/patronage.ts').PATRON_TOPICS) assert.ok(topic.saints.every(isPublishedSaintSlug));
  for (const guide of loadTs('lib/patron-guides.ts').PATRON_GUIDES) assert.ok(guide.saints.every(s => isPublishedSaintSlug(s.slug)));
});

test('unpublished observances and blesseds cannot supply the daily saint', () => {
  const { getSaintOfDay } = loadTs('lib/saint-of-day.ts');
  for (let m=1;m<=12;m++) for (let d=1;d<=31;d++) {
    const saint = getSaintOfDay(`${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
    if (saint) assert.equal(saint.kind, 'saint');
  }
});
