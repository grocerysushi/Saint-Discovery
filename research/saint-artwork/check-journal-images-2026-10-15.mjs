import fs from 'node:fs';
const origin = 'https://www.saintdiscoveryquiz.com';
const response = await fetch(`${origin}/api/blog/posts`, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw Error(`Journal inventory HTTP ${response.status}`);
const { posts } = await response.json();
const assets = new Set();
const missing = [];
function images(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'image' && node.attrs?.src) assets.add(node.attrs.src);
  for (const child of node.content ?? []) images(child);
}
for (const post of posts) {
  const article = post.published;
  if (!article) continue;
  if (!article.cover) missing.push(article.slug);
  else assets.add(article.cover);
  images(article.body);
}
const results = [];
for (const src of assets) {
  if (src.startsWith('data:image/')) { results.push({src:'embedded image',status:200}); continue; }
  const url = new URL(src, origin).href;
  let status = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    const image = await fetch(url, { method:'HEAD', headers:{'User-Agent':'SaintDiscoveryArtwork/1.0 (https://www.saintdiscoveryquiz.com; image availability review)'}, signal:AbortSignal.timeout(30000) });
    status = image.status;
    if (status !== 429 && status < 500) break;
    await new Promise(resolve => setTimeout(resolve, 11000));
  }
  results.push({ src, status });
  await new Promise(resolve => setTimeout(resolve, 400));
}
const record = {checkedAt:new Date().toISOString(),posts:posts.length,missingCovers:missing,assets:results.length,failed:results.filter(r=>r.status!==200),results};
fs.writeFileSync('research/saint-artwork/journal-images-2026-10-15.json', JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({...record,results:undefined}));
