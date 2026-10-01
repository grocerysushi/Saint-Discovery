import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
export const normalizeIdentity = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/^(saint|st\.?|blessed)\s+/u, '').replace(/[^\p{L}\p{N}]/gu, '');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const legacy = read('lib/data/saints.json');
const reviews = Object.assign({}, ...['saint-reviews','saint-reviews-research1','saint-reviews-research2','saint-reviews-research3','saint-reviews-root'].map(n => read(`lib/data/${n}.json`)));
const text = v => typeof v === 'string' && v.trim().length > 0;
const secure = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
export function validateEntries(entries) {
  if (!Array.isArray(entries)) throw new Error('Batch must be an array');
  const identities = new Map();
  for (const s of legacy) for (const name of [s.slug,s.name,reviews[s.slug]?.name].filter(Boolean)) identities.set(normalizeIdentity(name), s.slug);
  const keys = new Set();
  for (const e of entries) {
    const fail = message => { throw new Error(`${e.slug ?? 'entry'}: ${message}`); };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug) || !text(e.name)) fail('invalid identity');
    if (e.kind !== 'saint' || e.entry_type !== 'person') fail('only individually recognized Catholic saints are eligible');
    if (!secure(e.identity_key) || keys.has(e.identity_key)) fail('duplicate or invalid canonical identity key');
    keys.add(e.identity_key);
    if (!Array.isArray(e.alternate_names) || !e.alternate_names.every(text)) fail('alternate_names required');
    for (const name of new Set([e.slug,e.name,...e.alternate_names].map(normalizeIdentity))) {
      if (!name || identities.has(name)) fail(`identity or alias collision with ${identities.get(name)}: ${name}`);
      identities.set(name,e.slug);
    }
    if (!['Male','Female'].includes(e.gender)) fail('gender must be source-supported');
    if (!Array.isArray(e.biography) || e.biography.length < 2 || !e.biography.every(text) || e.biography.join(' ').split(/\s+/u).length < 65) fail('substantive original biography required');
    if (!Array.isArray(e.sources) || !e.sources.length || !e.sources.every(s => text(s.title) && secure(s.url))) fail('HTTPS citations required');
    if (!e.sources.some(s => s.url === e.identity_key)) fail('identity key must cite an individual source');
    if (!text(e.recognition_evidence) || !text(e.identity_review) || !text(e.uncertainty_note)) fail('recognition, identity review and limitations required');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.reviewed_on) || new Date(e.reviewed_on).toISOString().slice(0,10) !== e.reviewed_on) fail('valid review date required');
    if (e.feast_day !== null) {
      const date = new Date(`${e.feast_day}, 2024`);
      if (!Number.isFinite(date.getTime()) || date.toLocaleDateString('en-US',{month:'long',day:'numeric'}) !== e.feast_day || !secure(e.calendar_source) || !e.sources.some(s => s.url === e.calendar_source) || !text(e.calendar_scope)) fail('feast requires a valid date and scoped calendar citation');
    } else if (e.calendar_scope !== 'unverified' || e.calendar_source !== null) fail('unknown feast must be explicitly unverified');
    if (!text(e.feast_note)) fail('calendar explanation required');
    for (const key of ['dates','origin']) if (e[key] !== null && !text(e[key])) fail(`${key} must be text or null`);
    for (const key of ['vocations','orders']) if (!Array.isArray(e[key]) || !e[key].every(text)) fail(`${key} must be a curated list`);
  }
  return entries;
}
export function compile(entries) {
  return validateEntries(entries).map(e => ({
    saint: { id:`directory:${e.slug}`,slug:e.slug,name:e.name,kind:'saint',directory_only:true,alternate_names:e.alternate_names,tagline:'',description:e.biography[0],prayer:null,feast_day:e.feast_day,gender:e.gender,dates:e.dates,origin:e.origin,patron_of:null,quotes:[],fun_fact:null,...Object.fromEntries(['contemplative','charitable','intellectual','courageous','joyful','mystical'].map(t=>[`trait_${t}`,0])) },
    review: {status:'source-reviewed',reviewed_on:e.reviewed_on,review_method:'Individual Catholic institutional source review; original concise factual summary. '+e.identity_review,name:e.name,kind:'saint',feast_day:e.feast_day,feast_note:e.feast_note,origin:e.origin,dates:e.dates,patron_of:null,biography:e.biography,sources:e.sources,quotes:[],prayer:null,fun_fact:null},
    metadata:{vocations:e.vocations,orders:e.orders},
    provenance:{identity_key:e.identity_key,entry_type:e.entry_type,recognition_evidence:e.recognition_evidence,uncertainty_note:e.uncertainty_note,calendar_scope:e.calendar_scope,calendar_source:e.calendar_source}
  }));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if (args.length !== 1 || !['--write','--check'].includes(args[0])) throw new Error('Usage: node scripts/directory-expansion.mjs --write|--check');
  const dir=path.join(root,'research/directory-batches');
  const entries=fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort().flatMap(f=>read(`research/directory-batches/${f}`));
  const output=JSON.stringify(compile(entries),null,2)+'\n';
  const target=path.join(root,'lib/data/directory-additions.json');
  if(args[0]==='--write') fs.writeFileSync(target,output);
  else if(fs.readFileSync(target,'utf8')!==output) throw new Error('Generated directory additions are stale; run directory:build');
  console.log(`Verified ${entries.length} new unique individual Catholic saints; 0 aliases, groups or blesseds counted. No network or database writes.`);
}
