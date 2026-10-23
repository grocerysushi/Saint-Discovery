import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const saints = await loadTs('lib/saints.ts').getAllSaints();
const { getDirectoryPage, getDirectoryDailyCards, directoryNameRank, DIRECTORY_PAGE_SIZE } = loadTs('lib/directory-page.ts');
const { directoryUrl } = loadTs('lib/directory-url.ts');

test('every biography occurs on exactly one stable bounded directory page', () => {
  const first = getDirectoryPage(saints, {});
  assert.equal(first.saints.length, DIRECTORY_PAGE_SIZE);
  assert.equal(first.total, saints.length);
  const slugs = [];
  for (let page = 1; page <= first.pages; page++) {
    const current = getDirectoryPage(saints, { page: String(page) });
    assert.ok(current.validPage);
    assert.ok(current.saints.length <= DIRECTORY_PAGE_SIZE);
    assert.equal(current.offset, (page - 1) * DIRECTORY_PAGE_SIZE);
    slugs.push(...current.saints.map(s => s.slug));
  }
  assert.equal(new Set(slugs).size, saints.length);
  assert.deepEqual([...slugs].sort(), Array.from(saints, s => s.slug).sort());
  assert.deepEqual(getDirectoryPage(saints, {}).saints.map(s => s.slug), first.saints.map(s => s.slug));
});

test('server filters apply before pagination and persist in subsequent page URLs', () => {
  const data = getDirectoryPage(saints, { q: 'francis' });
  assert.equal(data.total, 61);
  assert.equal(data.saints.length, 36);
  assert.equal(data.pages, 2);
  const next = getDirectoryPage(saints, { q: 'francis', page: '2' });
  assert.equal(next.saints.length, 25);
  assert.equal(data.saints.some(s => next.saints.some(n => n.slug === s.slug)), false);
  assert.equal(directoryUrl(data.filters, 2), '/resources?q=francis&page=2');
  const women = getDirectoryPage(saints, { gender: 'Female', q: 'Thérèse', month: 'October', country: 'France' });
  assert.deepEqual(Array.from(women.saints, s => s.slug), ['therese-of-lisieux']);
  assert.equal(women.catalogueTotal, saints.length);
  assert.equal(directoryUrl(women.filters).includes('page='), false);
  assert.ok(women.options.country.includes('Korea'), 'options describe the whole catalogue');
});

test('empty searches are valid first pages; malformed or out-of-range pages are invalid', () => {
  const empty = getDirectoryPage(saints, { q: 'zzzz-no-such-saint' });
  assert.equal(empty.total, 0);
  assert.equal(empty.validPage, true);
  for (const page of ['0', '-1', '2.5', 'abc', '01', '100001', ['1', '2']]) assert.equal(getDirectoryPage(saints, { page }).validPage, false);
  assert.equal(getDirectoryPage(saints, { page: '999' }).validPage, false);
  assert.equal(getDirectoryPage(saints, { q: 'zzzz-no-such-saint', page: '2' }).validPage, false);
});

test('name and alias matches precede incidental descriptions without losing broader matches', () => {
  const results = [...getDirectoryPage(saints, { q: 'francis' }).saints, ...getDirectoryPage(saints, { q: 'francis', page: '2' }).saints];
  const ranks = results.map(saint => directoryNameRank(saint, 'francis'));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
  assert.ok(results.findIndex(s => s.slug === 'francis-of-assisi') < results.findIndex(s => s.slug === 'anthony-of-padua'));
  assert.equal(getDirectoryPage(saints, { q: 'Francis of Assisi' }).saints[0].slug, 'francis-of-assisi');
  assert.equal(getDirectoryPage(saints, { q: 'therese of lisieux' }).saints[0].slug, 'therese-of-lisieux');
  assert.equal(directoryNameRank({ name: 'St. Example', alternate_names: ['Thérèse'] }, 'therese'), 0);
  assert.equal(directoryNameRank({ name: 'St. Francis Xavier' }, 'francis'), 1);
  assert.equal(directoryNameRank({ name: 'St. Anthony' }, 'francis'), 4);
});

test('the daily endpoint projects only the local date cards, without quiz or calendar data', () => {
  const cards = getDirectoryDailyCards(saints, '09-30');
  assert.ok(cards.some(s => s.slug === 'jerome'));
  assert.ok(!cards.some(s => s.slug === 'therese-of-lisieux'));
  for (const card of cards) assert.deepEqual(Object.keys(card).sort(), ['description', 'kind', 'name', 'slug', 'tagline']);
});
