import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const editorial = loadTs('lib/directory-editorial.ts');
const { getBiographyReview, isPublishedSaintSlug } = loadTs('lib/saint-reviews.ts');

test('evidence notes and correction records refer to published identities and dated sources', () => {
  const ids = new Set();
  for (const [slug, note] of Object.entries(editorial.directoryEvidenceNotes)) {
    assert.ok(isPublishedSaintSlug(slug), slug);
    assert.equal(new Date(note.reviewed_on).toISOString().slice(0, 10), note.reviewed_on);
    for (const section of [note.history, note.calendar]) {
      assert.ok(section.text.trim());
      assert.ok(section.sources.length);
      for (const source of section.sources) {
        assert.ok(source.title.trim());
        assert.equal(new URL(source.url).protocol, 'https:');
      }
    }
    assert.ok(editorial.getDirectoryCorrections(slug).length, `${slug}: traceable update record`);
  }
  for (const entry of editorial.directoryCorrections) {
    assert.ok(!ids.has(entry.id), entry.id);
    ids.add(entry.id);
    assert.equal(new Date(entry.date).toISOString().slice(0, 10), entry.date);
    if (entry.slug !== null) assert.ok(isPublishedSaintSlug(entry.slug), entry.slug);
    assert.ok(['correction', 'clarification'].includes(entry.type));
    for (const field of ['title', 'before', 'after', 'method']) assert.ok(entry[field].trim(), field);
    assert.notEqual(entry.before, entry.after);
    if (entry.slug) assert.ok(entry.sources.length, `${entry.slug}: evidence for historical clarification`);
  }
});

test('revision metadata cannot hide a newer biography behind an older contribution', () => {
  const current = getBiographyReview('mary-magdalene');
  // Override its actual expansion file with a later revision while retaining content.
  const expansionName = ['1', '2', '3', '4'].map(n => `saint-biography-expansions-${n}.json`).find(name => {
    return Boolean(JSON.parse(fs.readFileSync(new URL(`../lib/data/${name}`, import.meta.url)))['mary-magdalene']);
  });
  assert.ok(expansionName);
  const override = { 'mary-magdalene': { biography: Array.from(current.biography), sources: Array.from(current.sources), reviewed_on: '2026-10-04', review_method: current.review_method } };
  const newer = loadTs('lib/directory-editorial.ts', { [expansionName]: override });
  assert.equal(newer.getBiographyUpdatedOn('mary-magdalene'), '2026-10-04');
  assert.equal(editorial.getBiographyUpdatedOn('mary-magdalene'), '2026-10-03');
  assert.equal(editorial.getBiographyUpdatedOn('unknown-saint'), null);
});

test('evidence and page-specific corrections resolve canonical aliases without leaking other changes', () => {
  const { reviews } = loadTs('lib/saint-reviews.ts');
  const [alias, duplicate] = Object.entries(reviews).find(([, review]) => review.status === 'duplicate');
  assert.equal(editorial.getBiographyUpdatedOn(alias), editorial.getBiographyUpdatedOn(duplicate.canonical_slug));
  assert.equal(editorial.getDirectoryEvidenceNote('unknown-saint'), null);
  assert.equal(editorial.getDirectoryCorrections('unknown-saint').length, 0);
  assert.ok(editorial.getDirectoryCorrections('christopher').every(entry => entry.slug === 'christopher'));
});
