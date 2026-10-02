import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {loadTs} from './load-ts.mjs';
const {getLiturgicalDay,validCivilDate,bannerColors}=loadTs('lib/liturgical-calendar.ts');
const data=JSON.parse(fs.readFileSync(new URL('../lib/data/liturgical-calendar.json',import.meta.url)));
const color=date=>getLiturgicalDay(date)?.colors[0];
test('reviewed national calendar covers every 2026–27 civil date with scoped provenance',()=>{
  assert.equal(Object.keys(data.days).length,730);
  for(const year of [2026,2027])for(let t=Date.UTC(year,0,1);t<Date.UTC(year+1,0,1);t+=86400000){const day=getLiturgicalDay(new Date(t).toISOString().slice(0,10));assert(day?.celebration);assert(day.colors.every(c=>Object.hasOwn(bannerColors,c)));assert(!day.eventKey.endsWith('_vigil'));}
  for(const source of data.sources){assert.equal(source.settings.national_calendar,'US');assert.equal(source.settings.ascension,'SUNDAY');assert.equal(source.settings.year_type,'CIVIL');assert.equal(source.apiVersion,'5.7');assert.match(source.sha256,/^[a-f0-9]{64}$/);}
  assert.doesNotMatch(JSON.stringify(data),/first_reading|responsorial_psalm|gospel_acclamation/);
});
test('principal celebrations take precedence over directory dates, optional memorials and commemorations',()=>{
  for(const [date,expected] of Object.entries({'2026-10-01':'white','2026-10-02':'white','2026-10-03':'green','2026-10-04':'green','2026-01-25':'green','2026-03-07':'violet','2026-03-19':'white','2026-03-25':'white','2026-06-13':'green','2027-06-05':'green'}))assert.equal(color(date),expected,date);
  assert.equal(getLiturgicalDay('2026-10-03').optionalMemorial,true);
  assert.match(getLiturgicalDay('2026-10-01').celebration,/Thérèse/);
  assert.match(getLiturgicalDay('2026-10-02').celebration,/Guardian Angels/);
});
test('Holy Week, transferred Annunciation and Sunday-Ascension scope are explicit',()=>{
  for(const [date,expected] of Object.entries({'2026-03-29':'red','2026-04-02':'white','2026-04-03':'red','2026-04-04':'white','2026-04-05':'white','2026-05-14':'red','2026-05-17':'white','2026-05-24':'red','2026-05-25':'white'}))assert.equal(color(date),expected,date);
  assert.match(getLiturgicalDay('2026-04-04').note,/after nightfall.*no daytime Mass/);
  assert.equal(getLiturgicalDay('2027-03-25').eventKey,'HolyThurs');
  assert.equal(getLiturgicalDay('2027-04-05').eventKey,'Annunciation');
  assert.equal(getLiturgicalDay('2026-05-14').eventKey,'StMatthiasAp');
});
test('rose is optional only on Advent III and Lent IV; All Souls has U.S. alternatives',()=>{
  const rose=Object.entries(data.days).filter(([,day])=>day.colors.includes('rose'));
  assert.equal(rose.length,4);
  for(const [date,day] of rose){assert(['Advent3','Lent4'].includes(day.eventKey),date);assert.equal(day.colors[0],'violet');assert.match(day.note,/may be used/);}
  assert.equal(JSON.stringify(getLiturgicalDay('2026-11-02').colors),JSON.stringify(['violet','white','black']));
});
test('missing, expired or invalid dates never acquire a guessed liturgical color',()=>{
  for(const date of ['2028-01-01','2025-12-31','2026-02-29','2026-13-01','bad',''])assert.equal(getLiturgicalDay(date),null,date);
  assert.equal(validCivilDate('2028-02-29'),true);
  assert.equal(getLiturgicalDay('2026-10-02',{}),null);
  const component=fs.readFileSync(new URL('../components/LiturgicalBanner.tsx',import.meta.url),'utf8');
  assert.match(component,/Calendar unavailable for this date/);assert.match(component,/Color not verified/);
  assert.doesNotMatch(component,/fetch\(/);
});
test('visitor date and next midnight respect UTC differences, year rollover and DST',()=>{
  const script=`import {loadTs} from './tests/load-ts.mjs';const {civilDateKey,millisecondsUntilLocalMidnight}=loadTs('lib/liturgical-calendar.ts');console.log(JSON.stringify([civilDateKey(new Date('2027-01-01T03:00:00Z')),civilDateKey(new Date('2026-10-02T03:00:00Z')),millisecondsUntilLocalMidnight(new Date(2026,2,8)),millisecondsUntilLocalMidnight(new Date(2026,10,1))]));`;
  const values=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',script],{env:{...process.env,TZ:'America/Chicago'},encoding:'utf8'}));
  assert.deepEqual(values,['2026-12-31','2026-10-01',23*3600000,25*3600000]);
});
test('API outages and unreviewed engine upgrades leave the reviewed cache unchanged',()=>{
  const file=new URL('../lib/data/liturgical-calendar.json',import.meta.url);
  const before=fs.readFileSync(file,'utf8');
  for(const mock of ["async()=>{throw new Error('simulated outage')}","async()=>({status:200,text:async()=>JSON.stringify({metadata:{version:'99.0'}})})"]){
    assert.throws(()=>execFileSync(process.execPath,['--input-type=module','-e',`globalThis.fetch=${mock};await import('./scripts/import-liturgical-calendar.mjs');`],{stdio:'pipe'}));
    assert.equal(fs.readFileSync(file,'utf8'),before);
  }
});
