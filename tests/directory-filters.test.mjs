import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const { getAllSaints } = loadTs('lib/saints.ts');
const { getDirectoryEntry, matchesDirectoryFilters, directoryOptions, EMPTY_FILTERS, UNCLASSIFIED } = loadTs('lib/directory-filters.ts');
const saints = await getAllSaints();
const bySlug = slug => saints.find(saint => saint.slug === slug);
const select = overrides => saints.filter(saint => matchesDirectoryFilters(saint, getDirectoryEntry(saint), { ...EMPTY_FILTERS, ...overrides }));

test('the default and reset state retain all published entries, including observances', () => {
  assert.equal(saints.length, 460);
  assert.equal(select({}).length, saints.length);
  assert.ok(select({ status: 'observance' }).some(saint => saint.slug === 'all-saints'));
  for (const status of ['saint', 'blessed', 'orthodox-saint']) {
    const results = select({ status });
    assert.ok(results.length > 0);
    assert.ok(results.every(saint => saint.kind === status));
  }
});

test('all filters compose, including gender, text, vocation, month, country and order', () => {
  const filters = { search: 'Thérèse', gender: 'Female', month: 'October', country: 'France', vocation: 'Religious sister', order: 'Carmelite family', status: 'saint' };
  assert.ok(select(filters).some(saint => saint.slug === 'therese-of-lisieux'));
  assert.equal(select({ ...filters, gender: 'Male' }).length, 0);
  assert.equal(select({ ...filters, month: 'May' }).length, 0);
  assert.ok(select({ search: ' Jesuits ' }).some(saint => saint.slug === 'ignatius-of-loyola'));
});

test('unknown classification is explicit and is not a claim of no religious membership', () => {
  assert.ok(select({ order: UNCLASSIFIED }).some(saint => saint.slug === 'elias-of-the-carmelites'));
  assert.equal(getDirectoryEntry(bySlug('elias-of-the-carmelites')).orders.length, 0);
  assert.ok(!select({ order: 'Carmelite family' }).some(saint => saint.slug === 'elias-of-the-carmelites'));
  assert.ok(select({ vocation: UNCLASSIFIED }).length > 0);
  const unknown = { ...bySlug('therese-of-lisieux'), slug: 'unclassified-fixture', origin: null, feast_day: null };
  const facets = getDirectoryEntry(unknown);
  assert.ok(matchesDirectoryFilters(unknown, facets, { ...EMPTY_FILTERS, month: UNCLASSIFIED, country: UNCLASSIFIED, vocation: UNCLASSIFIED, order: UNCLASSIFIED }));
});

test('geography preserves historical regions and multiple recorded associations', () => {
  const carlo = getDirectoryEntry(bySlug('carlo-acutis'));
  assert.ok(carlo.countries.includes('England'));
  assert.ok(carlo.countries.includes('Italy'));
  const joseph = getDirectoryEntry(bySlug('joseph'));
  assert.ok(joseph.countries.includes('Holy Land (historical region)'));
  assert.ok(!joseph.countries.includes('Israel'));
  assert.equal(getDirectoryEntry({ ...bySlug('joseph'), origin: 'Place of origin uncertain' }).countries.length, 0);
});

test('curated metadata only uses published canonical identities and nonduplicated classifications', () => {
  const metadata = JSON.parse(fs.readFileSync(new URL('../lib/data/saint-directory-metadata.json', import.meta.url)));
  for (const [slug, entry] of Object.entries(metadata)) {
    assert.ok(bySlug(slug), slug);
    for (const key of ['vocations', 'orders']) {
      assert.equal(new Set(entry[key]).size, entry[key].length, slug);
      assert.ok(entry[key].every(value => typeof value === 'string' && value.trim()), slug);
    }
  }
  const facets = saints.map(getDirectoryEntry);
  for (const key of ['countries', 'vocations', 'orders']) {
    const options = directoryOptions(facets, key);
    assert.equal(new Set(options).size, options.length);
    assert.ok(options.every(option => facets.some(entry => entry[key].includes(option))));
  }
});
