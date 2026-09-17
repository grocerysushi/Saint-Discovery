import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

// Isolated, local-only publication fixture. Never writes to InsForge or publishes.
test('production blog HTML, pagination, metadata, feeds and privacy boundaries', { timeout: 60000 }, async t => {
  const rows = Array.from({ length: 13 }, (_, i) => ({
    id: `fixture-${i + 1}`, publishedAt: '2026-09-17T12:00:00Z',
    published: { title: `Published faith article ${i + 1}`, slug: `published-faith-${i + 1}`, excerpt: `A sourced reflection & practical answer ${i + 1}.`, author: 'Saint Discovery', category: 'Everyday faith', cover: '', coverAlt: '', coverCredit: '', ads: false,
      body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: `SSR_PUBLISHED_BODY_${i + 1}` }] }] } },
  }));
  let outage = false;
  const requests = [];
  const backend = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost'); requests.push(url.pathname);
    if (outage || url.pathname !== '/api/database/records/blog_published_posts') { res.writeHead(503); res.end('{}'); return; }
    let filtered = rows;
    const slug = url.searchParams.get('published->>slug');
    if (slug) filtered = rows.filter(r => r.published.slug === slug.slice(3));
    const offset = Number(url.searchParams.get('offset') || 0);
    const limit = Number(url.searchParams.get('limit') || 500);
    const select = url.searchParams.get('select') || '';
    const body = filtered.slice(offset, offset + limit).map(r => Object.fromEntries(select.split(',').map(column => {
      const [alias, expression] = column.split(':');
      return [alias, expression?.startsWith('published->>') ? r.published[expression.slice(12)] : r[alias]];
    })));
    res.writeHead(200, { 'content-type': 'application/json', 'content-range': `${offset}-${offset + body.length - 1}/${filtered.length}` });
    res.end(JSON.stringify(body));
  });
  backend.listen(0, '127.0.0.1'); await once(backend, 'listening');
  const probe = http.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
  const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, SAINT_BUILD_DIR: process.env.SAINT_BUILD_DIR || '.next-daily/blog-seo-build', INSFORGE_BLOG_URL: `http://127.0.0.1:${backend.address().port}`, INSFORGE_BLOG_ANON_KEY: 'local-fixture-only', INSFORGE_API_KEY: '' },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = ''; app.stdout.on('data', d => { output += d; }); app.stderr.on('data', d => { output += d; });
  t.after(async () => { app.kill(); backend.closeAllConnections(); await new Promise(resolve => backend.close(resolve)); });
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { const response = await fetch(`${origin}/robots.txt`); if (response.ok) { ready = true; break; } } catch { /* Startup. */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, output);
  const get = async path => { const response = await fetch(origin + path, { headers: { 'user-agent': 'Twitterbot' } }); return { response, html: await response.text() }; };
  const visible = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const index = await get('/blog');
  assert.equal(index.response.status, 200, output);
  assert.match(visible(index.html), /Published faith article 1/);
  assert.match(index.html, /href="\/blog\?page=2"/);
  assert.doesNotMatch(index.html.match(/<meta name="robots"[^>]+>/)?.[0] || '', /noindex/);
  const second = await get('/blog?page=2');
  assert.match(visible(second.html), /Published faith article 13/);
  assert.match(second.html, /rel="canonical" href="https:\/\/www.saintdiscoveryquiz.com\/blog\?page=2"/);
  const article = await get('/blog/published-faith-1');
  assert.equal(article.response.status, 200);
  assert.match(visible(article.html), /SSR_PUBLISHED_BODY_1/);
  assert.match(article.html, /"@type":"BlogPosting"/);
  assert.match(article.html, /"@type":"BreadcrumbList"/);
  assert.match(article.html, /property="og:type" content="article"/);
  assert.match(article.html, /rel="canonical" href="https:\/\/www.saintdiscoveryquiz.com\/blog\/published-faith-1"/);
  const missing = await get('/blog/private-draft');
  assert.equal(missing.response.status, 404); assert.match(missing.html, /noindex/);
  const admin = await get('/admin/blog'); assert.match(admin.html, /noindex/);
  const filtered = await get('/blog?q=prayer'); assert.match(filtered.html, /noindex/);
  const sitemap = await get('/blog/sitemap.xml'); assert.equal((sitemap.html.match(/<loc>/g) || []).length, 14); assert.doesNotMatch(sitemap.html, /private-draft/);
  const feed = await get('/blog/feed.xml'); assert.match(feed.html, /reflection &amp; practical/); assert.equal((feed.html.match(/<item>/g) || []).length, 13);
  outage = true;
  const failed = await get('/blog/sitemap.xml'); assert.equal(failed.response.status, 503);
  assert.ok(requests.every(path => path === '/api/database/records/blog_published_posts'), 'Public routes must never query draft tables');
});
