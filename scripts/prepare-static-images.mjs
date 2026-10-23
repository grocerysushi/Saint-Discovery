// Run before deploying new artwork: npm run images:prepare [-- --refresh-blog].
// Only public article metadata is read; originals, attribution and licenses stay intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse } from 'parse5';
import { loadTs } from '../tests/load-ts.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const dataDir = path.join(root, 'lib/data');
const output = path.join(root, 'public/images/responsive');
await fs.mkdir(output, { recursive: true });
const read = async name => JSON.parse(await fs.readFile(path.join(dataDir, name), 'utf8'));
const save = async (name, value) => fs.writeFile(path.join(dataDir, name), JSON.stringify(value, null, 2) + '\n');
const normalize = src => { try { const u = new URL(src); for (const k of [...u.searchParams.keys()]) if (k.startsWith('utm_')) u.searchParams.delete(k); return u.href; } catch { return src; } };
async function fetchPublic(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'SaintDiscoveryArtwork/1.0 (saintdiscoveryquiz.com)' }, signal: AbortSignal.timeout(45000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${url}`);
  return r;
}
function nodes(node, predicate, found = []) { if (predicate(node)) found.push(node); for (const child of node.childNodes ?? []) nodes(child, predicate, found); return found; }
if (process.argv.includes('--refresh-blog')) {
  const xml = await (await fetchPublic('https://www.saintdiscoveryquiz.com/blog/sitemap.xml')).text();
  const urls = [...xml.matchAll(/<loc>(https:\/\/www\.saintdiscoveryquiz\.com\/blog\/[^<]+)<\/loc>/g)].map(m => m[1]);
  const articles = [];
  for (let i = 0; i < urls.length; i += 4) {
    const batch = await Promise.all(urls.slice(i, i + 4).map(async url => {
      const doc = parse(await (await fetchPublic(url)).text());
      const schemas = nodes(doc, n => n.tagName === 'script' && n.attrs?.some(a => a.name === 'type' && a.value === 'application/ld+json'))
        .flatMap(n => JSON.parse(n.childNodes.map(c => c.value ?? '').join('')));
      const article = schemas.find(s => s['@type'] === 'BlogPosting');
      if (!article) throw new Error(`Missing article metadata: ${url}`);
      // Structured data retains the editorial source after the displayed img
      // switches to a generated variant. Never ingest our own thumbnail as
      // the next run's source key.
      const cover = Array.isArray(article.image) ? article.image[0] : article.image;
      let src = cover;
      if (src?.startsWith('https://www.saintdiscoveryquiz.com/')) src = new URL(src).pathname;
      if (src?.startsWith('/_next/image?')) src = new URL(src, url).searchParams.get('url');
      if (!src) throw new Error(`Missing cover: ${url}`);
      return { slug: url.split('/').pop(), title: article.headline, excerpt: article.description, category: article.articleSection, publishedAt: article.datePublished, cover: normalize(src) };
    }));
    articles.push(...batch);
  }
  await save('blog-artwork-catalog.json', articles.sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)));
}
const old = await read('responsive-images.json').catch(() => ({}));
const catalog = await read('blog-artwork-catalog.json').catch(() => []);
const localAssets = await read('saint-artwork-local.json');
function commonsIdentity(src) {
  try {
    const u = new URL(src);
    if (!['upload.wikimedia.org', 'thumb.wikimedia.org', 'commons.wikimedia.org'].includes(u.hostname)) return null;
    const p = decodeURIComponent(u.pathname);
    const thumb = p.match(/\/commons\/thumb\/[a-f0-9]\/[a-f0-9]{2}\/([^/]+)\//);
    return thumb?.[1] ?? p.split('/').pop();
  } catch { return null; }
}
const localByIdentity = new Map(Object.entries(localAssets).map(([url, file]) => [commonsIdentity(url), file]));
const sourceCache = path.join(root, '.cache/artwork-sources');
await fs.mkdir(sourceCache, { recursive: true });
const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
const saints = await loadTs('lib/saints.ts').getAllSaints();
const sources = [...new Set([...saints.map(s => getSaintArtwork(s).src), ...catalog.map(p => p.cover)])].sort();
const manifest = {};
let sourceBytes = 0, outputBytes = 0, failures = [];
for (const src of sources) {
  if (/\.svg(?:\?|$)/i.test(src)) continue;
  try {
    // Remote originals are not downloaded again when verified variants exist.
    if (src.startsWith('https:') && old[src] && (await Promise.all(old[src].variants.map(v => fs.access(path.join(root, 'public', v[1])).then(()=>true,()=>false)))).every(Boolean)) {
      manifest[src] = old[src]; continue;
    }
    if (!src.startsWith('/') && !/^https:\/\/(upload|thumb)\.wikimedia\.org\/wikipedia\/commons\//.test(src)
      && !src.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/')
      && !src.startsWith('https://images.metmuseum.org/CRDImages/')) continue;
    const cached = path.join(sourceCache, createHash('sha256').update(src).digest('hex') + '.image');
    const local = src.startsWith('/') ? src : localAssets[src] ?? localByIdentity.get(commonsIdentity(src));
    let bytes;
    if (local) bytes = await fs.readFile(path.join(root, 'public', local));
    else {
      try { bytes = await fs.readFile(cached); } catch {
        // Commons recommends its standard thumbnail sizes for automated reuse.
        const download = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-f0-9]\/[a-f0-9]{2}\//.test(src)
          ? 'https://commons.wikimedia.org/wiki/Special:Redirect/file/' + new URL(src).pathname.split('/').pop() + '?width=960'
          : src;
        bytes = Buffer.from(await (await fetchPublic(download)).arrayBuffer());
        await fs.writeFile(cached, bytes);
      }
    }
    const meta = await sharp(bytes).metadata();
    if (!meta.width || !meta.height || (meta.pages ?? 1) > 1) continue;
    sourceBytes += bytes.length;
    const hash = createHash('sha256').update(bytes).update('webp-q78-v1').digest('hex').slice(0, 20);
    const widths = [...new Set([384, 768, 1280].map(w => Math.min(w, meta.width)))];
    const variants = [];
    for (const width of widths) {
      const url = `/images/responsive/${hash}-${width}.webp`;
      const target = path.join(root, 'public', url);
      try { await fs.access(target); } catch { await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(target); }
      outputBytes += (await fs.stat(target)).size;
      variants.push([width, url]);
    }
    manifest[src] = { width: meta.width, height: meta.height, variants };
  } catch (e) { failures.push({ src, error: e.message }); if (old[src]) manifest[src] = old[src]; }
}
await save('responsive-images.json', manifest);
console.log(JSON.stringify({ sources: sources.length, prepared: Object.keys(manifest).length, sourceBytes, outputBytes, failures }, null, 2));
await fs.writeFile(path.join(sourceCache, 'failures.json'), JSON.stringify(failures, null, 2));
if (failures.length) process.exitCode = 1;
