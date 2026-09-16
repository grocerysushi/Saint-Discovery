import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';
const { reviews } = loadTs('lib/saint-reviews.ts');
const catalog = JSON.parse(fs.readFileSync(new URL('../lib/data/saints.json', import.meta.url)));

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
