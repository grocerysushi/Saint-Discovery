import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const { saintContributions, getSaintContribution } = loadTs('lib/saint-contributions.ts');
const { reviews } = loadTs('lib/saint-reviews.ts');

test('all legacy canonical biographies retain their sourced contribution and reflection', () => {
  const legacySlugs = new Set(JSON.parse(fs.readFileSync(new URL('../lib/data/saints.json', import.meta.url))).map(s => s.slug));
  const eligible = Object.keys(reviews).filter(slug => legacySlugs.has(slug) && reviews[slug].status === 'source-reviewed').sort();
  assert.deepEqual(Object.keys(saintContributions).sort(), eligible);
  const paragraphs = new Set();
  const reflections = new Set();
  for (const slug of eligible) {
    const entry = getSaintContribution(slug);
    assert.ok(entry.title.trim(), slug);
    assert.ok(entry.paragraphs.length >= 2, slug);
    for (const paragraph of entry.paragraphs) {
      assert.ok(paragraph.trim(), slug);
      assert.ok(!paragraphs.has(paragraph), `${slug}: repeated contribution paragraph`);
      assert.ok(!reviews[slug].biography.includes(paragraph), `${slug}: repeats existing biography`);
      paragraphs.add(paragraph);
    }
    assert.ok(entry.reflection.trim(), slug);
    assert.ok(!reflections.has(entry.reflection), `${slug}: repeated reflection`);
    reflections.add(entry.reflection);
    assert.match(entry.reviewed_on, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isFinite(Date.parse(entry.reviewed_on)), slug);
    assert.ok(entry.sources.length, slug);
    assert.equal(new Set(entry.sources.map(source => source.url)).size, entry.sources.length, slug);
    for (const source of entry.sources) {
      assert.ok(source.title.trim(), slug);
      assert.equal(new URL(source.url).protocol, 'https:', slug);
    }
  }
});

test('contributions reject unknown, unresolved, alias, and duplicate identities', () => {
  const empty = Object.fromEntries([1, 2, 3, 4].map(n => [`saint-contributions-${n}.json`, {}]));
  const [slug, sample] = Object.entries(saintContributions)[0];
  for (const invalid of ['unknown-test-saint', ...Object.keys(reviews).filter(key => reviews[key].status !== 'source-reviewed')]) {
    assert.throws(() => loadTs('lib/saint-contributions.ts', { ...empty, 'saint-contributions-1.json': { [invalid]: sample } }), /requires a reviewed canonical identity/);
  }
  assert.throws(() => loadTs('lib/saint-contributions.ts', { ...empty, 'saint-contributions-1.json': { [slug]: sample }, 'saint-contributions-2.json': { [slug]: sample } }), /Duplicate saint contribution/);
  assert.equal(getSaintContribution('unknown-test-saint'), undefined);
});
