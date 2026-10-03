import fs from 'node:fs';
import crypto from 'node:crypto';
const events = new Map();
const sources = [];
for (const year of [2026, 2027]) {
  const url = `https://litcal.johnromanodorazio.com/api/v5/calendar/nation/US/${year}?year_type=CIVIL&locale=en_US&ascension=SUNDAY`;
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw Error(`${year}: ${response.status}`);
  const text = await response.text();
  const data = JSON.parse(text);
  sources.push({ url, retrievedAt: new Date().toISOString(), sha256: crypto.createHash('sha256').update(text).digest('hex'), version: data.metadata.version });
  for (const event of data.litcal) {
    if (event.type !== 'fixed' || event.grade < 1 || event.is_vigil_mass) continue;
    const date = event.date.slice(5, 10);
    events.set(`${date}:${event.event_key}`, { date, key: event.event_key, name: event.name, grade: event.grade });
  }
}
const output = { sources, events: [...events.values()].sort((a,b) => a.date.localeCompare(b.date) || b.grade - a.grade) };
fs.writeFileSync('research/saint-artwork/us-events.json', JSON.stringify(output, null, 2) + '\n');
console.log(output.events.map(e => `${e.date} | ${e.grade} | ${e.key} | ${e.name}`).join('\n'));
