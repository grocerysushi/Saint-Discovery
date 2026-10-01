import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compile, validateEntries } from '../scripts/directory-expansion.mjs';
import { loadTs } from './load-ts.mjs';
const entries = JSON.parse(fs.readFileSync(new URL('../research/directory-batches/2026-10-01-jesuit-saints.json', import.meta.url)));
const generated = JSON.parse(fs.readFileSync(new URL('../lib/data/directory-additions.json', import.meta.url)));

test('reproducible batch adds 21 unique named Catholic saints with sources and unknown calendars', async () => {
  assert.deepEqual(compile(entries),generated);
  assert.equal(entries.length,21);
  const {getAllSaints,getSaintBySlug,getAllSaintSlugs}=loadTs('lib/saints.ts');
  const all=await getAllSaints();
  assert.equal(all.length,447);
  assert.equal(new Set(all.map(s=>s.slug)).size,447);
  for(const e of entries) {
    const saint=await getSaintBySlug(e.slug);
    assert.equal(saint.name,e.name);
    assert.ok(getAllSaintSlugs().includes(e.slug));
    assert.equal(saint.directory_only,true);
    assert.equal(saint.feast_day,null);
    assert.equal(saint.prayer,null);
    assert.equal(saint.patron_of,null);
  }
});

test('validation refuses duplicates, legacy aliases, blesseds, groups, thin content and unscoped dates', () => {
  const clone=()=>structuredClone(entries[0]);
  const duplicate=clone();duplicate.slug='another-bobola';
  assert.throws(()=>validateEntries([entries[0],duplicate]),/duplicate|collision/);
  const alias=clone();alias.alternate_names.push('Albertus Magnus');
  assert.throws(()=>validateEntries([alias]),/collision/);
  for(const [key,value] of [['kind','blessed'],['entry_type','group'],['biography',['Placeholder']],['feast_day','May 16'],['identity_key','http://example.org'],['reviewed_on','2026-02-30']]) {
    const entry=clone();entry[key]=value;
    assert.throws(()=>validateEntries([entry]));
  }
});

test('alternate names are searchable and additions never become quiz matches', async () => {
  const {getAllSaints}=loadTs('lib/saints.ts');
  const all=await getAllSaints();
  const {getDirectoryEntry,matchesDirectoryFilters,EMPTY_FILTERS}=loadTs('lib/directory-filters.ts');
  for(const e of entries) for(const alias of e.alternate_names) {
    const saint=all.find(s=>s.slug===e.slug);
    assert.ok(matchesDirectoryFilters(saint,getDirectoryEntry(saint),{...EMPTY_FILTERS,search:alias}));
  }
  const {rankSaints}=loadTs('lib/scoring.ts');
  const scores=Object.fromEntries(['contemplative','charitable','intellectual','courageous','joyful','mystical'].map(k=>[k,1]));
  assert.ok(rankSaints(scores,all).every(m=>!m.saint.directory_only));
  const impostor={...generated[0].saint,trait_contemplative:10};
  assert.equal(rankSaints(scores,[impostor]).length,0);
});
