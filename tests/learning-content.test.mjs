import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const { getAllSaints, getSaintBySlug } = loadTs('lib/saints.ts');
const { getSaintLearningGuide } = loadTs('lib/saint-learning-guides.ts');
const { getBiographyReview } = loadTs('lib/saint-reviews.ts');
const { getProfileUpdatedOn } = loadTs('lib/profile-updates.ts');
const { READING_PATHS } = loadTs('lib/reading-paths.ts');

test('every paired reading destination resolves to a published saint with a real reading guide', async () => {
  const slugs = READING_PATHS.flatMap(path => Array.from(path.slugs));
  assert.equal(new Set(slugs).size, 8);
  for (const slug of slugs) {
    assert.equal((await getSaintBySlug(slug))?.kind, 'saint', slug);
    const guide = getSaintLearningGuide(slug);
    assert.ok(guide?.reading.exercise && guide?.reading.introduction, slug);
    for (const url of [guide.reading.url, ...guide.faqs.map(faq => faq.source.url)]) assert.equal(new URL(url).protocol, 'https:');
  }
  assert.equal((await getAllSaints()).length, 487, 'Reading paths must not add identities');
  assert.equal(getSaintLearningGuide('unlisted-person'), undefined);
});

test('content timestamps use the newest actual revision and do not hide a newer biography behind older supplemental content', () => {
  for (const slug of ['ignatius-of-loyola', 'peter-faber', 'francis-of-assisi', 'catherine-of-siena']) assert.equal(getProfileUpdatedOn(slug), '2026-10-04', slug);
  assert.equal(getProfileUpdatedOn('unlisted-person'), undefined);
  assert.equal(getBiographyReview('francis-of-assisi').reviewed_on, '2026-09-16', 'Adding an exercise must not claim a new full biography review');
});

test('focused content revisions keep evidence limits and directory-only eligibility intact', async () => {
  const faber = await getSaintBySlug('peter-faber');
  assert.equal(faber.directory_only, true);
  assert.equal(faber.feast_day, null);
  assert.equal(getBiographyReview('peter-faber').sources.length, 2);
  const exercises = new Set();
  for (const slug of ['ignatius-of-loyola', 'peter-faber', 'francis-of-assisi', 'catherine-of-siena']) {
    const guide = getSaintLearningGuide(slug);
    assert.ok(guide.sourceContext, slug);
    assert.equal(guide.reviewedOn, '2026-10-04');
    exercises.add(guide.reading.exercise);
  }
  assert.equal(exercises.size, 4, 'Focused profiles need distinct exercises');
});
