import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compile, validateEntries } from '../scripts/directory-expansion.mjs';
import { loadTs } from './load-ts.mjs';
const batches = new URL('../research/directory-batches/', import.meta.url);
const entries = fs.readdirSync(batches).filter(file => file.endsWith('.json')).sort()
  .flatMap(file => JSON.parse(fs.readFileSync(new URL(file, batches))));
const generated = JSON.parse(fs.readFileSync(new URL('../lib/data/directory-additions.json', import.meta.url)));

test('reproducible batches add 200 distinct saints and preserve all earlier additions', async () => {
  assert.deepEqual(compile(entries),generated);
  assert.equal(entries.length,399);
  const {getAllSaints,getSaintBySlug,getAllSaintSlugs}=loadTs('lib/saints.ts');
  const all=await getAllSaints();
  assert.equal(all.length,825);
  assert.equal(new Set(all.map(s=>s.slug)).size,825);
  for(const e of entries) {
    const saint=await getSaintBySlug(e.slug);
    assert.equal(saint.name,e.name);
    assert.ok(getAllSaintSlugs().includes(e.slug));
    assert.equal(saint.directory_only,true);
    assert.equal(saint.feast_day,e.feast_day);
    assert.equal(saint.prayer,null);
    assert.equal(saint.patron_of,null);
  }
});

test('Korean batch preserves individual identities and records source limitations', () => {
  const korean = JSON.parse(fs.readFileSync(new URL('2026-10-01-korean-martyrs.json', batches)));
  assert.equal(korean.length,40);
  assert.equal(korean.filter(e => e.gender === 'Female').length,27);
  assert.ok(korean.every(e => e.vocations.includes('Lay life')), 'Use the existing directory vocabulary');
  const sourceIds = korean.map(e => Number(new URL(e.identity_key).pathname.split('/').at(-1)));
  assert.equal(new Set(sourceIds).size,40);
  assert.ok(!sourceIds.includes(1) && !sourceIds.includes(2), 'Existing Andrew and Paul are not recounted');
  assert.ok(!sourceIds.includes(19) && !sourceIds.includes(20), 'Deferred sparse biographies are not published');
  const bySlug = Object.fromEntries(korean.map(e => [e.slug,e]));
  assert.equal(bySlug['maria-won-kwi-im'].dates,'d. 1839', 'Conflicting birth metadata is withheld');
  assert.equal(bySlug['john-pak-hu-jae'].dates,'1798 or 1799-1839');
  assert.match(bySlug['lucia-kim-july-1839'].uncertainty_note,/not CBCK identity 45/);
  assert.notEqual(bySlug['barbara-yi'].identity_key,bySlug['barbara-yi-chong-hui'].identity_key);
  assert.notEqual(bySlug['agnes-kim-hyo-ju'].identity_key,bySlug['columba-kim-hyo-im'].identity_key);
});

test('200-person expansion has individual Catholic recognition, sourced biographies and honest calendar limits', () => {
  const files = ['2026-10-03-modern-canonizations.json','2026-10-03-asian-martyrs.json','2026-10-03-historical-saints.json'];
  const groups = files.map(file => JSON.parse(fs.readFileSync(new URL(file,batches))));
  assert.deepEqual(groups.map(group=>group.length),[70,70,60]);
  const added = groups.flat();
  assert.equal(new Set(added.map(entry=>entry.identity_key)).size,200);
  const oldSlugs = new Set(entries.filter(entry=>entry.reviewed_on!=='2026-10-03').map(entry=>entry.slug));
  assert.equal(oldSlugs.size,199);
  for(const entry of added) {
    assert.equal(entry.kind,'saint');
    assert.equal(entry.entry_type,'person');
    assert.ok(!oldSlugs.has(entry.slug));
    assert.ok(entry.sources.some(source=>source.url===entry.identity_key));
    assert.ok(entry.recognition_evidence.length>50);
    assert.match(entry.identity_review,/AI-assisted|AI assistance/i);
    assert.equal(entry.feast_day,null);
    assert.equal(entry.calendar_scope,'unverified');
    assert.equal(entry.calendar_source,null);
  }
  assert.ok(!added.some(entry=>['agnes-le-thi-thanh','andrew-dung-lac'].includes(entry.slug)), 'Existing Vietnamese identities are not recounted');
  assert.match(groups[0].find(entry=>entry.slug==='jose-gregorio-hernandez-cisneros').recognition_evidence,/2025/);
  const oldGenerated=generated.filter(entry=>oldSlugs.has(entry.saint.slug));
  assert.deepEqual(oldGenerated,compile(entries.filter(entry=>oldSlugs.has(entry.slug))));
});

test('100-person expansion uses individual recognition sources and preserves uncertain Korean identities', () => {
  const korean=JSON.parse(fs.readFileSync(new URL('2026-10-01-korean-martyrs-completion.json',batches)));
  const worldwide=JSON.parse(fs.readFileSync(new URL('2026-10-01-vatican-saints.json',batches)));
  assert.equal(korean.length,58);
  assert.equal(worldwide.length,42);
  const newEntries=[...korean,...worldwide];
  assert.equal(new Set(newEntries.map(e=>e.identity_key)).size,100);
  assert.ok(newEntries.every(e=>e.kind==='saint' && e.entry_type==='person'));
  const ids=entries.filter(e=>new URL(e.identity_key).hostname==='cbck.or.kr').map(e=>Number(new URL(e.identity_key).pathname.split('/').at(-1)));
  assert.equal(ids.length,98);
  assert.equal(new Set(ids).size,98);
  for(const id of [1,2,19,20,68]) assert.ok(!ids.includes(id),`Existing or deferred CBCK identity ${id} remains excluded`);
  const lucias=entries.filter(e=>[23,45].includes(Number(new URL(e.identity_key).pathname.split('/').at(-1))));
  assert.equal(lucias.length,2);
  assert.notEqual(lucias[0].slug,lucias[1].slug);
  assert.match(lucias.find(e=>e.slug==='lucia-kim-prison-1839').biography.join(' '),/widow|older|seventy/i);
  assert.match(lucias.find(e=>e.slug==='lucia-kim-july-1839').biography.join(' '),/July/);
  for(const entry of worldwide) {
    assert.equal(new URL(entry.identity_key).hostname,'www.vatican.va');
    assert.ok(entry.sources.some(s=>s.url.endsWith('/saints/index_saints_en.html')));
  }
  assert.match(worldwide.find(e=>e.slug==='josep-manyanet-y-vives').uncertainty_note,/1833.*1933/);
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
