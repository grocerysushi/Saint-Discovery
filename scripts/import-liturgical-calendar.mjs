// Explicit editorial maintenance command. Never invoked by a page or build.
// Modified, reduced factual output of LiturgicalCalendarAPI (Apache-2.0).
// Excludes readings, vigils of the following day and optional memorial choices.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const years = [2026, 2027];
const reviewedOn = '2026-10-02';
const reviewedVersion = '5.7';
const upstreamRevision = '91d391f8cca97a2688f68cabe74c5231ebacc181';
const fixtures = {
  '2026-01-25':['OrdSunday3','green'], '2026-03-07':['LentWeekday2Saturday','violet'],
  '2026-03-15':['Lent4','violet'], '2026-03-19':['StJoseph','white'],
  '2026-03-25':['Annunciation','white'], '2026-03-29':['PalmSun','red'],
  '2026-04-02':['HolyThurs','white'], '2026-04-03':['GoodFri','red'],
  '2026-04-04':['EasterVigil','white'], '2026-05-14':['StMatthiasAp','red'],
  '2026-05-17':['Ascension','white'], '2026-06-13':['ReviewedWeekday','green'],
  '2026-10-01':['StThereseChildJesus','white'], '2026-10-02':['GuardianAngels','white'],
  '2026-10-04':['OrdSunday27','green'], '2026-11-01':['AllSaints','white'],
  '2026-11-02':['AllSouls','violet'], '2026-12-13':['Advent3','violet'],
  '2027-04-05':['Annunciation','white'], '2027-06-05':['ReviewedWeekday','green'],
  '2027-12-12':['Advent3','violet'],
};
const result = { reviewedOn, upstreamRevision, coverage:years, scope:'U.S. Roman Rite; Ascension on Sunday; civil dates',
  attribution:'Reduced and modified calendar output from LiturgicalCalendarAPI, John Romano D\u2019Orazio and contributors, Apache-2.0. No USCCB calendar compilation or readings reproduced.',
  sources:[], days:{} };
for (const year of years) {
  const url = `https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/${year}?year_type=CIVIL&locale=en_US&ascension=SUNDAY`;
  const response = await fetch(url, {headers:{Accept:'application/json','Accept-Language':'en-US'},signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,200,`Calendar response ${year}`);
  const text = await response.text(); const data = JSON.parse(text);
  assert.equal(data.metadata.version,reviewedVersion,'New upstream version requires editorial review');
  const settings={year,national_calendar:'US',year_type:'CIVIL',locale:'en_US',ascension:'SUNDAY',epiphany:'SUNDAY_JAN2_JAN8',corpus_christi:'SUNDAY'};
  for (const [key,value] of Object.entries(settings)) assert.equal(data.settings[key],value,`Unexpected calendar setting: ${key}`);
  const grouped = new Map();
  for (const event of data.litcal) {
    if (event.is_vigil_mass || event.year !== year) continue;
    const date = event.date.slice(0,10);
    grouped.set(date,[...(grouped.get(date)||[]),event]);
  }
  const expectedDays = (Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
  assert.equal(grouped.size,expectedDays,`Incomplete year ${year}`);
  for (const [date,events] of [...grouped].sort(([a],[b])=>a.localeCompare(b))) {
    const principal = events.filter(e=>e.grade >= 3).sort((a,b)=>b.grade-a.grade)[0] || events.find(e=>e.grade===0);
    let event = principal;
    let note = '';
    if (!event && ['2026-06-13','2027-06-05'].includes(date)) {
      // USCCB annual notes 6b (2026), 6c (2027): both memorials become optional.
      event = {event_key:'ReviewedWeekday',name:'Weekday in Ordinary Time',color:['green']};
      note = 'The coinciding memorials are optional; this banner follows the weekday.';
    }
    assert(event,`No reviewed principal celebration for ${date}`);
    let colors = [...new Set(event.color.map(c=>c==='purple'?'violet':c))];
    if (colors.includes('rose')) colors = ['violet','rose']; // rose is optional, never compulsory
    if (event.event_key==='AllSouls') { colors=['violet','white','black']; note='Violet, white or black may be used in the United States.'; }
    if (event.event_key==='EasterVigil') note='White is for the Easter Vigil after nightfall. Holy Saturday has no daytime Mass.';
    if (event.event_key==='HolyThurs') note='White is for the evening Mass of the Lord\u2019s Supper; this is a civil-date guide.';
    if (colors.includes('rose')) note='Rose may be used where customary; violet remains valid.';
    assert(colors.length && colors.every(c=>['white','red','green','violet','rose','black'].includes(c)),`Unsupported color ${date}`);
    result.days[date] = { celebration:event.name.replace(/^\[ USA \] /,''), eventKey:event.event_key, colors, ...(note?{note}:{}), optionalMemorial:events.some(e=>e.grade===2) && (!principal || principal.grade===0) };
  }
  result.sources.push({year,url,apiVersion:data.metadata.version,retrievedAt:new Date().toISOString(),sha256:crypto.createHash('sha256').update(text).digest('hex'),settings});
}
for (const [date,[key,color]] of Object.entries(fixtures)) {
  assert.equal(result.days[date].eventKey,key,`Principal celebration: ${date}`);
  assert.equal(result.days[date].colors[0],color,`Principal color: ${date}`);
}
// Write only after every year and editorial fixture passes; API failure preserves the cache.
const output = fileURLToPath(new URL('../lib/data/liturgical-calendar.json',import.meta.url));
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(`Saved ${Object.keys(result.days).length} reviewed civil dates. No readings or directory changes.`);
