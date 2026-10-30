import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
import fs from 'node:fs';
const { teachingStages, teachingSources } = loadTs('lib/teaching-session.ts');
const source = JSON.parse(fs.readFileSync(new URL('../data/educator-resources.json', import.meta.url), 'utf8'));

test('teaching view preserves every stage and its exact lesson text', () => {
  assert.equal(teachingStages.length, 6);
  teachingStages.forEach((stage, i) => {
    const original = source.lesson.pages[1].sections[i];
    assert.equal(`${stage.timing} | ${stage.title}`, original.title);
    assert.deepEqual(Array.from(stage.body), original.body);
    for (const body of stage.body) for (const match of body.matchAll(/\[(\d+(?:, \d+)*)\]/g)) {
      for (const number of match[1].split(', ')) assert.ok(teachingSources[Number(number) - 1]?.url.startsWith('https://'));
    }
  });
});

test('suggested stages cover 45 minutes without gaps or overlaps', () => {
  let end = 0;
  for (const stage of teachingStages) {
    const match = stage.timing.match(/^(\d+)-(\d+) minutes$/);
    assert.ok(match);
    assert.equal(Number(match[1]), end);
    assert.ok(Number(match[2]) > end);
    end = Number(match[2]);
  }
  assert.equal(end, 45);
});
