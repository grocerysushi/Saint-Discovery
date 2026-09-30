import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const { matchSaint, rankSaints } = loadTs('lib/scoring.ts');
const { moreQuizSaints } = loadTs('lib/quiz-results.ts');
const traits = ['contemplative', 'charitable', 'intellectual', 'courageous', 'joyful', 'mystical'];
const profile = values => Object.fromEntries(traits.map((key, index) => [key, values[index]]));
const saint = (slug, values, extra = {}) => ({ slug, kind: 'saint', ...Object.fromEntries(traits.map((key, index) => [`trait_${key}`, values[index]])), ...extra });
const slugs = matches => Array.from(matches, match => match.saint.slug);

test('changing answer emphasis selects the corresponding profile, even against broadly high ratings', () => {
  const pool = [saint('broad', [10, 10, 10, 10, 10, 10]), saint('service', [1, 10, 1, 2, 2, 1]), saint('study', [2, 1, 10, 1, 1, 2])];
  assert.equal(matchSaint(profile([1, 8, 1, 2, 2, 1]), pool).slug, 'service');
  assert.equal(matchSaint(profile([2, 1, 8, 1, 1, 2]), pool).slug, 'study');
  assert.equal(matchSaint(profile([5, 5, 5, 5, 5, 5]), pool).slug, 'broad');
});

test('all six themes matter: profiles with the same leading pair still separate', () => {
  const pool = [saint('reflective-service', [8, 10, 1, 1, 1, 6]), saint('active-service', [8, 10, 1, 6, 1, 1])];
  assert.equal(matchSaint(profile([8, 10, 1, 1, 1, 5]), pool).slug, 'reflective-service');
  assert.equal(matchSaint(profile([8, 10, 1, 5, 1, 1]), pool).slug, 'active-service');
});

test('rankings ignore score scale and directory order, including equal matches', () => {
  const pool = [saint('one', [1, 8, 2, 3, 1, 2]), saint('two', [1, 8, 2, 3, 1, 2]), saint('three', [8, 1, 2, 3, 1, 2])];
  const scores = profile([2, 12, 3, 6, 2, 1]);
  const expected = slugs(rankSaints(scores, pool));
  assert.deepEqual(slugs(rankSaints(scores, [...pool].reverse())), expected);
  assert.deepEqual(slugs(rankSaints(profile(Object.values(scores).map(value => value * 100)), pool)), expected);
  assert.deepEqual(slugs(rankSaints(scores, pool.map(entry => Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, key.startsWith('trait_') ? value * 3 : value]))))), expected);
  assert.deepEqual(slugs(rankSaints(scores, pool)), expected);
});

test('equally rated saints are not permanently awarded to the first record', () => {
  const pool = [saint('alpha', [1, 6, 2, 4, 1, 2]), saint('beta', [1, 6, 2, 4, 1, 2])];
  const winners = new Set();
  for (let i = 1; i <= 60; i++) {
    const scores = profile([2, i, 3, 4, 1, 2]);
    const winner = matchSaint(scores, pool).slug;
    winners.add(winner);
    assert.equal(matchSaint(scores, [...pool].reverse()).slug, winner);
  }
  assert.equal(winners.size, 2);
});

test('similarity stays finite and bounded, with an exact fit above a disjoint one', () => {
  const pool = [saint('fit', [0, 1, 0, 0, 0, 0]), saint('disjoint', [0, 0, 1, 0, 0, 0])];
  const results = rankSaints(profile([0, 1e308, 0, 0, 0, 0]), pool);
  assert.deepEqual(slugs(results), ['fit', 'disjoint']);
  assert.ok(Math.abs(results[0].similarity - 1) < 1e-12);
  assert.ok(results[1].similarity < results[0].similarity);
  for (const item of rankSaints(profile([1e308, 1e308, 1e308, 1e308, 1e308, 1e308]), pool)) {
    assert.ok(Number.isFinite(item.similarity) && item.similarity >= 0 && item.similarity <= 1);
  }
});

test('empty or invalid saint pools cannot silently produce an unusable result', () => {
  const valid = saint('valid', [1, 4, 2, 3, 1, 2]);
  const scores = profile([1, 4, 2, 3, 1, 2]);
  const invalid = [saint('zero', [0, 0, 0, 0, 0, 0]), saint('broken', [NaN, 1, 2, 3, 4, 5]), saint('negative', [-1, 1, 2, 3, 4, 5]), { ...valid, slug: 'withdrawn', kind: 'unresolved' }, { ...valid, slug: 'observance', kind: 'observance' }];
  assert.deepEqual(slugs(rankSaints(scores, [...invalid, valid, valid])), ['valid']);
  assert.throws(() => matchSaint(scores, invalid), /No eligible saint/);
  assert.throws(() => matchSaint(scores, []), /No eligible saint/);
  for (const value of [NaN, Infinity, -1]) assert.throws(() => rankSaints({ ...scores, charitable: value }, [valid]), /finite and non-negative/);
  assert.deepEqual(slugs(rankSaints(profile([0, 0, 0, 0, 0, 0]), [valid])), ['valid']);
});

test('related suggestions follow the same ranking and preserve the supplied gender pool', () => {
  const all = JSON.parse(fs.readFileSync('lib/data/quiz-saints.json', 'utf8'));
  const { applySaintReview, canonicalSaintSlug } = loadTs('lib/saint-reviews.ts');
  const candidates = all.filter(s => canonicalSaintSlug(s.slug) === s.slug).map(applySaintReview);
  for (const gender of ['Male', 'Female']) {
    const pool = candidates.filter(s => s.gender === gender);
    const ranked = rankSaints(profile([2, 8, 2, 6, 3, 1]), pool);
    assert.ok(ranked.length > 3);
    const best = matchSaint(profile([2, 8, 2, 6, 3, 1]), pool);
    const related = moreQuizSaints(profile([2, 8, 2, 6, 3, 1]), pool, best.slug);
    assert.equal(best.slug, ranked[0].saint.slug);
    assert.deepEqual(Array.from(related, s => s.slug), slugs(ranked).slice(1, 4));
    assert.ok(related.every(s => s.gender === gender));
  }
});
