import fs from 'node:fs';
import { loadTs } from '../tests/load-ts.mjs';

const saints = await loadTs('lib/saints.ts').getAllSaints();
const saved = Object.assign({}, ...['saint-images', 'saint-image-overrides', 'saint-generated-images'].map(name => JSON.parse(fs.readFileSync(`lib/data/${name}.json`, 'utf8'))));
const dir = 'research/saint-artwork';
fs.mkdirSync(dir, { recursive: true });
const missing = saints.filter(saint => !saved[saint.slug]);
fs.writeFileSync(`${dir}/missing.json`, JSON.stringify(missing.map(s => ({ slug: s.slug, name: s.name, alternateNames: s.alternate_names ?? [], dates: s.dates, origin: s.origin })), null, 2) + '\n');
console.log(JSON.stringify({ total: saints.length, assigned: saints.length - missing.length, missing: missing.length }));

if (process.argv.includes('--discover')) {
  async function api(host, params) {
    const url = new URL(`https://${host}/w/api.php`);
    url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', ...params });
    const response = await fetch(url, { headers: { 'User-Agent': 'SaintDiscoveryArtwork/1.0 (https://www.saintdiscoveryquiz.com; image provenance review)' }, signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`${host}: ${response.status}`);
    return response.json();
  }
  const titlesFor = saint => [saint.name, `Saint ${saint.name}`, ...(saint.alternate_names ?? []).filter(n => n.length > 5)];
  const titles = [...new Set(missing.flatMap(titlesFor))];
  const pages = new Map();
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    const data = await api('en.wikipedia.org', { titles: batch.join('|'), redirects: '1', prop: 'pageimages|pageprops', piprop: 'name', pilicense: 'free' });
    const redirects = new Map([...(data.query.normalized ?? []), ...(data.query.redirects ?? [])].map(r => [r.from, r.to]));
    const resolve = input => { const visited = new Set(); while (redirects.has(input) && !visited.has(input)) { visited.add(input); input = redirects.get(input); } return input; };
    for (const title of batch) pages.set(title, data.query.pages.find(p => p.title === resolve(title)));
    console.log(`Discovery ${Math.min(i + 40, titles.length)}/${titles.length}`);
  }
  const candidates = [];
  for (const saint of missing) {
    const page = titlesFor(saint).map(t => pages.get(t)).find(p => p && !p.missing && p.pageimage && !Object.hasOwn(p.pageprops ?? {}, 'disambiguation'));
    if (page) candidates.push({ slug: saint.slug, name: saint.name, page });
  }
  const files = [...new Set(candidates.map(c => `File:${c.page.pageimage}`))];
  const fileInfo = new Map();
  for (let i = 0; i < files.length; i += 40) {
    const data = await api('commons.wikimedia.org', { titles: files.slice(i, i + 40).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '960' });
    for (const page of data.query.pages) if (page.imageinfo?.[0]) fileInfo.set(page.title.replaceAll('_', ' '), page.imageinfo[0]);
  }
  const result = candidates.map(c => ({ ...c, image: fileInfo.get(`File:${c.page.pageimage.replaceAll('_', ' ')}`) ?? null }));
  fs.writeFileSync(`${dir}/candidates.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ candidates: result.length, withCommonsMetadata: result.filter(c => c.image).length }));
}
