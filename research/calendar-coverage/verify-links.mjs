import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const selections = read('research/calendar-coverage/selections.json');
const selected = new Set(selections.map(row => row[1]));
const supplemental = Object.values(read('lib/data/saint-calendar-commemorations.json')).flat();
const batches = fs.readdirSync(path.join(root, 'research/directory-batches'))
  .filter(name => name.endsWith('.json'))
  .flatMap(name => read(`research/directory-batches/${name}`))
  .filter(entry => selected.has(entry.slug));
const urls = [...new Set([...supplemental, ...batches].flatMap(entry => entry.sources.map(source => source.url)))];
const results = [];
for (let index = 0; index < urls.length; index += 6) {
  const group = await Promise.all(urls.slice(index, index + 6).map(async url => {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'SaintDiscoveryCalendarReview/1.0 (+https://www.saintdiscoveryquiz.com)' }, signal: AbortSignal.timeout(25000) });
      await response.text();
      return { url, status: response.status, finalUrl: response.url };
    } catch (error) {
      return { url, status: null, error: error.message };
    }
  }));
  results.push(...group);
}
fs.writeFileSync(path.join(root, 'research/calendar-coverage/link-checks.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
const failures = results.filter(result => result.status !== 200);
console.log(JSON.stringify({ checked: results.length, passed: results.length - failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
