import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';
const { reviews } = loadTs('lib/saint-reviews.ts');
const catalog = JSON.parse(fs.readFileSync(new URL('../lib/data/saints.json', import.meta.url)));
const readData = name => JSON.parse(fs.readFileSync(new URL(`../lib/data/${name}.json`, import.meta.url)));
const baseReviews = Object.assign({}, ...['saint-reviews', 'saint-reviews-research1', 'saint-reviews-research2', 'saint-reviews-research3', 'saint-reviews-root'].map(readData));
const expansionBatches = [1, 2, 3, 4].map(n => readData(`saint-biography-expansions-${n}`));
const wordCount = paragraphs => paragraphs.join(' ').trim().split(/\s+/u).length;

test('all 460 reviewed canonical biographies are expanded without changing identity metadata', () => {
  const entries = expansionBatches.flatMap(batch => Object.entries(batch));
  assert.equal(entries.length, 460);
  assert.equal(new Set(entries.map(([slug]) => slug)).size, 460);
  const eligible = Object.entries(baseReviews).filter(([, review]) => review.status === 'source-reviewed').map(([slug]) => slug).sort();
  assert.deepEqual(entries.map(([slug]) => slug).sort(), eligible);
  for (const [slug, expansion] of entries) {
    const base = baseReviews[slug];
    assert.ok(expansion.biography.length >= 4, slug);
    assert.ok(expansion.biography.every(paragraph => paragraph.trim().length > 0), slug);
    assert.ok(wordCount(expansion.biography) >= wordCount(base.biography) + 50, `${slug}: meaningful additional detail`);
    assert.ok(expansion.sources.length > 0, slug);
    for (const source of expansion.sources) {
      assert.equal(new URL(source.url).protocol, 'https:', slug);
      assert.ok(source.title.trim(), slug);
    }
    assert.deepEqual(Array.from(reviews[slug].biography), expansion.biography, `${slug}: expansion is live`);
    for (const key of ['status', 'kind', 'name', 'feast_day', 'feast_note', 'origin', 'dates', 'patron_of', 'prayer', 'fun_fact']) {
      assert.equal(reviews[slug][key], base[key], `${slug}: preserved ${key}`);
    }
    assert.deepEqual(Array.from(reviews[slug].quotes), base.quotes, `${slug}: preserved quotes`);
  }
});

test('expansion overlays reject unknown identities, unresolved identities, aliases, and duplicate keys', () => {
  const sample = Object.values(expansionBatches[0])[0];
  const empty = Object.fromEntries([1, 2, 3, 4].map(n => [`saint-biography-expansions-${n}.json`, {}]));
  const invalidSlugs = ['unknown-test-saint', ...['duplicate', 'needs-identification'].map(status => Object.keys(baseReviews).find(slug => baseReviews[slug].status === status))];
  for (const slug of invalidSlugs) {
    assert.ok(slug);
    assert.throws(() => loadTs('lib/saint-reviews.ts', { ...empty, 'saint-biography-expansions-1.json': { [slug]: sample } }), /requires a reviewed canonical identity/);
  }
  const slug = Object.keys(expansionBatches[0])[0];
  assert.throws(() => loadTs('lib/saint-reviews.ts', { ...empty, 'saint-biography-expansions-1.json': { [slug]: sample }, 'saint-biography-expansions-2.json': { [slug]: sample } }), /Duplicate biography expansion/);
});

test('every reviewed identity has traceable sources; aliases resolve without chains or lost routes', async () => {
  const { getAllSaints, getAllSaintSlugs, getSaintBySlug } = loadTs('lib/saints.ts');
  const all = await getAllSaints();
  assert.equal(Object.keys(reviews).length, catalog.length, 'Every original entry must have a review outcome');
  assert.equal(getAllSaintSlugs().length, catalog.length);
  assert.equal(new Set(all.map(s => s.slug)).size, all.length);
  for (const [slug, review] of Object.entries(reviews)) {
    assert.ok(catalog.some(s => s.slug === slug), slug);
    if (review.status === 'duplicate') {
      assert.equal(reviews[review.canonical_slug]?.status, 'source-reviewed', slug);
      assert.equal((await getSaintBySlug(slug)).slug, review.canonical_slug, slug);
      assert.ok(!all.some(s => s.slug === slug), slug);
    } else {
      assert.ok(review.sources.length > 0, slug);
      for (const source of review.sources) {
        assert.equal(new URL(source.url).protocol, 'https:', slug);
        assert.ok(source.title.trim(), slug);
      }
      assert.ok(review.biography.length >= 2, slug);
      if (review.status === 'needs-identification') {
        assert.equal(review.kind, 'unresolved', slug);
        assert.ok(!all.some(s => s.slug === slug), slug);
        assert.equal((await getSaintBySlug(slug)).kind, 'unresolved', slug);
      }
    }
  }
});

test('reviewed corrections remove legacy quotations and preserve quiz traits', async () => {
  const { getSaintBySlug } = loadTs('lib/saints.ts');
  const original = catalog.find(s => s.slug === 'albert-the-great');
  const saint = await getSaintBySlug('albertus-magnus');
  assert.equal(saint.slug, 'albert-the-great');
  assert.equal(saint.feast_day, 'November 15');
  assert.equal(saint.prayer, null);
  assert.equal(saint.quotes.length, 0);
  for (const key of Object.keys(original).filter(key => key.startsWith('trait_'))) assert.equal(saint[key], original[key]);
  const { saintDisplayName } = loadTs('lib/saint-seo.ts');
  assert.equal(saintDisplayName(await getSaintBySlug('anne-catherine-emmerich')), 'Blessed Anne Catherine Emmerich');
  assert.equal(saintDisplayName(await getSaintBySlug('all-souls')), 'All Souls');
});

test('unsupported patronage cannot survive through the legacy topic index', () => {
  const { PATRON_TOPICS, getPatronLinksForSaint } = loadTs('lib/patronage.ts');
  assert.equal(getPatronLinksForSaint('abraham').length, 0);
  assert.ok(!PATRON_TOPICS.some(topic => topic.saints.includes('abraham')));
  assert.ok(PATRON_TOPICS.every(topic => topic.saints.length > 0));
});
