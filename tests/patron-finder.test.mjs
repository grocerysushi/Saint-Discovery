import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { patronSearchMatch, PATRON_SEARCH_TERMS } = loadTs('lib/patron-finder.ts');
const { PATRON_GUIDES } = loadTs('lib/patron-guides.ts');

test('patron finder handles blank input, accents, punctuation and multiword searches', () => {
  assert.equal(patronSearchMatch('  ', ['Students']), true);
  assert.equal(patronSearchMatch('THÉRÈSE', ['St. Thérèse of Lisieux']), true);
  assert.equal(patronSearchMatch('john god', ['St. John of God']), true);
  assert.equal(patronSearchMatch('john nurses', ['Nurses', 'St. John of God']), true);
  assert.equal(patronSearchMatch('unknown', ['Nurses']), false);
});

test('plain-language starting points find existing guides without changing patronage classifications', () => {
  const find = query => PATRON_GUIDES.filter(guide => patronSearchMatch(query, [guide.label, guide.description, PATRON_SEARCH_TERMS[guide.slug] ?? '']));
  for (const [query, slug] of [['family','parents'], ['study','students'], ['care','nurses'], ['loss','grief'], ['decisions','difficult-decisions']]) {
    assert.ok(find(query).some(guide => guide.slug === slug), query);
  }
  assert.ok(find('loss').find(guide => guide.slug === 'grief').saints.every(saint => saint.connection === 'Spiritual companion'));
  assert.equal(find('no-such-topic-zqx').length, 0);
});
