import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { PATRON_GUIDES, getPatronGuide, getGuidesForSaint } = loadTs('lib/patron-guides.ts');
const { getAllSaints } = loadTs('lib/saints.ts');

test('every guide links to published canonical biographies and traceable sources', async () => {
  const saints = new Set((await getAllSaints()).map(saint => saint.slug));
  assert.deepEqual(Array.from(PATRON_GUIDES, guide => guide.slug), ['blacksmiths', 'nurses', 'parents', 'students', 'grief', 'difficult-decisions']);
  for (const guide of PATRON_GUIDES) {
    assert.equal(getPatronGuide(guide.slug), guide);
    assert.ok(guide.description.length > 50);
    assert.ok(guide.distinction.length > 50);
    assert.match(guide.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(guide.practice.steps.length >= 3);
    assert.ok(guide.questions.length >= 2);
    for (const entry of guide.saints) {
      assert.ok(saints.has(entry.slug), `${guide.slug}: ${entry.slug} is published`);
      assert.ok(entry.explanation.length > 200);
      assert.ok(entry.sources.length > 0);
      assert.ok(getGuidesForSaint(entry.slug).includes(guide));
      for (const source of entry.sources) {
        assert.equal(new URL(source.url).protocol, 'https:');
        assert.ok(source.title);
      }
    }
  }
  assert.equal(getPatronGuide('unknown'), null);
  assert.equal(getGuidesForSaint('unknown').length, 0);
});

test('suggested companions do not become official patronages in the legacy index', () => {
  const { PATRON_TOPICS, getPatronLinksForSaint } = loadTs('lib/patronage.ts');
  for (const slug of ['grief', 'difficult-decisions']) {
    const guide = getPatronGuide(slug);
    assert.ok(guide.saints.every(saint => saint.connection === 'Spiritual companion'));
  }
  assert.ok(getPatronGuide('nurses').saints.every(saint => saint.connection === 'Documented patronage'));
  assert.equal(getPatronGuide('students').saints.find(saint => saint.slug === 'john-bosco').connection, 'Spiritual companion');
  assert.equal(getPatronGuide('blacksmiths').saints[0].connection, 'Traditional patronage');
  assert.ok(!getPatronGuide('blacksmiths').saints.some(saint => saint.slug === 'gerard-majella'));
  assert.ok(!PATRON_TOPICS.some(topic => topic.saints.includes('abraham')));
  assert.equal(getPatronLinksForSaint('abraham').length, 0);
});
