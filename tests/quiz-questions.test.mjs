import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const data = JSON.parse(fs.readFileSync(new URL('../lib/data/quiz.json', import.meta.url)));
const questions = data.questions.map(q => ({ ...q, options: data.options.filter(o => o.question_id === q.id) }));
const traits = ['contemplative', 'charitable', 'intellectual', 'courageous', 'joyful', 'mystical'];
const zero = () => Object.fromEntries(traits.map(key => [key, 0]));
const { normalizeQuizScores, shuffleQuizOptions } = loadTs('lib/quiz-questions.ts');
const { matchSaint } = loadTs('lib/scoring.ts');
const sumAnswers = answers => answers.reduce((scores, option) => {
  for (const key of traits) scores[key] += option[`trait_${key}`];
  return scores;
}, zero());

test('question IDs and option ownership remain safe for navigation and every theme is reachable', () => {
  assert.equal(new Set(data.questions.map(q => q.id)).size, 20);
  assert.equal(new Set(data.options.map(o => o.id)).size, 80);
  assert.equal(data.options.filter(o => !data.questions.some(q => q.id === o.question_id)).length, 0);
  for (const question of questions) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options.map(o => o.label)).size, 4);
    for (const option of question.options) for (const key of traits) {
      assert.ok(Number.isInteger(option[`trait_${key}`]) && option[`trait_${key}`] >= 0 && option[`trait_${key}`] <= 3);
    }
  }
  for (const key of traits) assert.ok(data.options.some(o => o[`trait_${key}`] > 0));
});

test('shuffling preserves option identities/weights without mutating content or changing question order', () => {
  const before = structuredClone(questions);
  const shuffled = shuffleQuizOptions(questions, () => 0);
  assert.deepEqual(questions, before);
  assert.deepEqual(Array.from(shuffled, q => q.id), questions.map(q => q.id));
  for (const q of shuffled) {
    const original = questions.find(o => o.id === q.id);
    assert.notDeepEqual(Array.from(q.options, o => o.id), original.options.map(o => o.id));
    assert.deepEqual(Array.from(q.options).sort((a, b) => a.id.localeCompare(b.id)), [...original.options].sort((a, b) => a.id.localeCompare(b.id)));
  }
});

test('every theme has the same normalized ceiling regardless of available points', () => {
  for (const key of traits) {
    const answers = questions.map(q => [...q.options].sort((a, b) => b[`trait_${key}`] - a[`trait_${key}`])[0]);
    const normalized = normalizeQuizScores(sumAnswers(answers), questions);
    assert.equal(normalized[key], 100);
    assert.ok(traits.every(t => Number.isFinite(normalized[t]) && normalized[t] >= 0 && normalized[t] <= 100));
  }
  assert.deepEqual({ ...normalizeQuizScores(zero(), []) }, zero());
});

test('equal proportions of available points produce a balanced saint match despite unequal raw totals', () => {
  const option = weights => ({ ...Object.fromEntries(traits.map(t => [`trait_${t}`, 0])), ...weights });
  const uneven = [
    { options: [option({ trait_charitable: 3 }), option({ trait_courageous: 1 })] },
    { options: [option({ trait_charitable: 3 }), option({ trait_courageous: 3 })] },
  ];
  const raw = { ...zero(), charitable: 3, courageous: 2 };
  const balanced = { slug: 'balanced', kind: 'saint', ...option({ trait_charitable: 1, trait_courageous: 1 }) };
  const charity = { slug: 'charity', kind: 'saint', ...option({ trait_charitable: 3, trait_courageous: 2 }) };
  assert.equal(matchSaint(raw, [balanced, charity]).slug, 'charity');
  const normalized = normalizeQuizScores(raw, uneven);
  assert.equal(normalized.charitable, normalized.courageous);
  assert.equal(matchSaint(normalized, [balanced, charity]).slug, 'balanced');
});

test('rewinding an answer restores the prior profile and order has no scoring effect', () => {
  const answers = questions.map(q => q.options[0]);
  const raw = sumAnswers(answers);
  const rewound = { ...raw };
  const last = answers.at(-1);
  for (const key of traits) rewound[key] -= last[`trait_${key}`];
  assert.deepEqual(rewound, sumAnswers(answers.slice(0, -1)));
  const shuffled = shuffleQuizOptions(questions, () => 0.37);
  const restored = shuffled.map((q, i) => q.options.find(o => o.id === answers[i].id));
  assert.deepEqual({ ...normalizeQuizScores(sumAnswers(restored), shuffled) }, { ...normalizeQuizScores(raw, questions) });
  const { parseQuizResult } = loadTs('lib/quiz-session.ts');
  assert.ok(parseQuizResult(JSON.stringify({ version: 1, gender: 'Male', slug: 'francis-of-assisi', scores: normalizeQuizScores(raw, questions) })));
});
