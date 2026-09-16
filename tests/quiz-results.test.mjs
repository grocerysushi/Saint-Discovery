import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { moreQuizSaints, strongestTraits, resultPath } = loadTs('lib/quiz-results.ts');
const scores = { contemplative: 4, charitable: 8, intellectual: 2, courageous: 6, joyful: 1, mystical: 0 };

test('tab result recovery accepts only valid identities and finite bounded scores', () => {
  const { parseQuizResult } = loadTs('lib/quiz-session.ts');
  const saved = { version: 1, slug: 'francis-of-assisi', gender: 'Male', scores };
  assert.equal(parseQuizResult(JSON.stringify(saved)).slug, saved.slug);
  for (const raw of [null, '', '{broken', 'null', JSON.stringify({ ...saved, version: 2 }), JSON.stringify({ ...saved, slug: '../redirect' }), JSON.stringify({ ...saved, gender: 'invalid' }), JSON.stringify({ ...saved, scores: { ...scores, charitable: -1 } }), JSON.stringify({ ...saved, scores: { ...scores, mystical: null } }), JSON.stringify({ ...saved, scores: { ...scores, joyful: 10001 } })]) {
    assert.equal(parseQuizResult(raw), null);
  }
});

test('result suggestions exclude the match, duplicate slugs, and withdrawn or non-person entries', async () => {
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  const first = saints.find(saint => saint.kind === 'saint');
  const candidates = [first, first, ...saints, { ...first, slug: 'unresolved-test', kind: 'unresolved' }];
  const suggestions = moreQuizSaints(scores, candidates, first.slug);
  assert.equal(suggestions.length, 3);
  assert.equal(new Set(suggestions.map(saint => saint.slug)).size, 3);
  assert.ok(suggestions.every(saint => saint.slug !== first.slug && !['unresolved', 'observance'].includes(saint.kind)));
  assert.equal(moreQuizSaints(scores, [first], first.slug).length, 0);
});

test('share paths contain only the saint identity and trait summaries ignore zero scores', () => {
  assert.equal(resultPath('francis-of-assisi'), '/quiz/results/francis-of-assisi');
  assert.equal(resultPath('name?extra=value'), '/quiz/results/name%3Fextra%3Dvalue');
  assert.deepEqual(Array.from(strongestTraits(scores)), ['charitable', 'courageous']);
  assert.equal(strongestTraits(Object.fromEntries(Object.keys(scores).map(key => [key, 0]))).length, 0);
});
