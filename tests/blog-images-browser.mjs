import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { startBlogBackend } from './helpers/blog-postgrest-fixture.mjs';

// Local production app + isolated read-only backend fixture; never publishes.
const output = path.resolve(process.env.BLOG_IMAGE_EVIDENCE_DIR || 'research/blog-images-2026-10-14');
await fs.mkdir(output, { recursive: true });
const artworks = [
  { slug: 'jesus-prayer', title: 'How to Pray the Jesus Prayer', cover: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Christ_Icon_Sinai_6th_century.jpg', coverAlt: 'Sixth-century icon of Christ holding a Gospel book and raising his right hand in blessing.', coverCredit: "Christ Pantocrator, sixth century, unknown artist. Saint Catherine's Monastery, Sinai. Public-domain reproduction via Wikimedia Commons (PD-Art/PD-old-100-expired)." },
  { slug: 'act-of-contrition', title: 'What Is an Act of Contrition?', cover: 'https://upload.wikimedia.org/wikipedia/commons/0/07/El_Greco_-_Tears_of_St._Peter_-_NG.M.01346_-_National_Museum_of_Art%2C_Architecture_and_Design.jpg', coverAlt: 'Saint Peter with clasped hands and an upward gaze, painted by El Greco.', coverCredit: 'El Greco, Tears of St. Peter, 1590s. National Museum, Oslo, NG.M.01346. Digital reproduction via Wikimedia Commons, CC BY 4.0. No editorial alterations; display may crop.' },
];
const rows = Array.from({ length: 12 }, (_, i) => ({
  id: `image-fixture-${String(i).padStart(2, '0')}`, publishedAt: '2026-10-14T12:00:00Z',
  published: { ...artworks[i === 2 ? 1 : 0], slug: i === 1 ? artworks[0].slug : i === 2 ? artworks[1].slug : `image-fixture-${i}`, excerpt: 'Read the story and explore its sacred artwork.', author: 'Saint Discovery', category: 'Everyday faith', ads: true, body: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Local image rendering verification.' }] }] } },
}));
// Exercise the editor-compatible fallback through the same public component.
rows[3].published.cover = 'https://example.org/editor-art.png';
rows[4].published.cover = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
rows[5].published.cover = 'https://example.org/broken.png';
const backend = await startBlogBackend(rows);
const probe = http.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, SAINT_BUILD_DIR: process.env.SAINT_BUILD_DIR || '.next-daily/blog-images-build', INSFORGE_BLOG_URL: backend.origin, INSFORGE_BLOG_ANON_KEY: 'local-fixture-only', INSFORGE_API_KEY: '' },
  windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = ''; app.stdout.on('data', data => { logs += data; }); app.stderr.on('data', data => { logs += data; });
let browser;
const report = { checkedAt: new Date().toISOString(), original: [], measurements: [], checks: [] };
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(origin + '/robots.txt')).ok) { ready = true; break; } } catch { /* Startup */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, logs);
  for (const art of artworks) {
    const response = await fetch(art.cover, { headers: { 'User-Agent': 'SaintDiscovery-image-verification/1.0 (https://www.saintdiscoveryquiz.com)' } });
    assert.equal(response.status, 200, art.slug);
    report.original.push({ slug: art.slug, bytes: (await response.arrayBuffer()).byteLength });
  }
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) return route.abort();
    if (/google-analytics|googletagmanager/.test(route.request().url())) return route.abort();
    if (route.request().url() === rows[3].published.cover) return route.fulfill({ contentType: 'image/png', body: Buffer.from(rows[4].published.cover.split(',')[1], 'base64') });
    if (route.request().url() === rows[5].published.cover) return route.fulfill({ status: 404, body: '' });
    return route.continue();
  });
  const page = await context.newPage();
  page.on('response', response => {
    if (response.url().includes('/_next/image?') && response.status() !== 200) (report.imageErrors ??= []).push({ url: response.url(), status: response.status() });
  });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const inspect = async (locator, slug, label) => {
    await locator.scrollIntoViewIfNeeded();
    await locator.evaluate(img => img.decode());
    const data = await locator.evaluate(img => {
      const resource = performance.getEntriesByName(img.currentSrc).at(-1);
      return { currentSrc: img.currentSrc, sizes: img.sizes, srcset: img.srcset, alt: img.alt, cssWidth: img.getBoundingClientRect().width, cssHeight: img.getBoundingClientRect().height, loading: img.loading, browserEncodedBytes: resource?.encodedBodySize, browserTransferBytes: resource?.transferSize };
    });
    assert.match(data.currentSrc, /\/_next\/image\?/);
    const width = Number(new URL(data.currentSrc).searchParams.get('w'));
    if (label.startsWith('mobile')) assert.ok(width >= 400 && width <= 800, `${label}: selected ${width}`);
    const response = await context.request.get(data.currentSrc, { headers: { Accept: 'image/webp' } });
    assert.equal(response.status(), 200, `${label}: optimizer response`);
    const bytes = (await response.body()).length;
    const originalBytes = report.original.find(row => row.slug === slug).bytes;
    assert.ok(bytes < originalBytes * .4, `${label}: ${bytes} vs original ${originalBytes}`);
    report.measurements.push({ label, slug, width, bytes, originalBytes, reductionPercent: Number((100 * (1 - bytes / originalBytes)).toFixed(1)), format: response.headers()['content-type'], ...data });
  };
  await page.goto(origin + '/blog');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.blog-feature img').evaluate(img => img.decode());
  assert.equal(await page.locator('.blog-public img[loading="eager"]').count(), 1);
  assert.equal(await page.locator('.blog-public img[loading="lazy"]').count() + await page.locator('.blog-card-art .blog-art-placeholder').count(), 11);
  for (const art of artworks) {
    const card = page.locator(`.blog-story-card[href="/blog/${art.slug}"]`);
    await inspect(card.locator('img'), art.slug, 'mobile-card');
    await card.screenshot({ path: path.join(output, `${art.slug}-card-optimized.png`) });
    await card.locator('img').evaluate((img, src) => { img.removeAttribute('srcset'); img.src = src; }, art.cover);
    await card.locator('img').evaluate(img => img.decode());
    await card.screenshot({ path: path.join(output, `${art.slug}-card-original.png`) });
  }
  for (const index of [3, 4]) {
    const img = page.locator(`.blog-story-card[href="/blog/image-fixture-${index}"] img`);
    await img.scrollIntoViewIfNeeded(); await img.evaluate(img => img.decode());
    assert.equal(await img.getAttribute('srcset'), null);
  }
  const broken = page.locator('.blog-story-card[href="/blog/image-fixture-5"]');
  await broken.scrollIntoViewIfNeeded(); await broken.locator('.blog-art-placeholder').waitFor();
  report.checks.push('12 cover slots; only lead eager; other 11 lazy; external and data uploads render; broken cover retains frame and accessible placeholder');
  for (const [label, width] of [['mobile', 390], ['desktop', 1440]]) {
    await page.setViewportSize({ width, height: label === 'mobile' ? 844 : 1000 });
    await page.goto(origin + '/blog');
    await page.locator('.blog-feature img').evaluate(img => img.decode());
    await page.screenshot({ path: path.join(output, `journal-${label}.png`) });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    for (const art of artworks) {
      await page.goto(origin + '/blog/' + art.slug);
      await inspect(page.locator('.blog-cover img'), art.slug, `${label}-article`);
      assert.equal(await page.locator('.blog-cover img').getAttribute('alt'), art.coverAlt);
      assert.equal(await page.locator('.blog-cover figcaption').textContent(), art.coverCredit);
      assert.ok((await page.content()).includes(art.cover), 'Original retained in article metadata');
      const frame = page.locator('.blog-cover-frame');
      const bounds = await frame.boundingBox();
      assert.ok(Math.abs(bounds.width / bounds.height - 16 / 9) < .01);
      await frame.screenshot({ path: path.join(output, `${art.slug}-cover-${label}-optimized.png`) });
      await page.locator('.blog-cover img').evaluate((img, src) => { img.removeAttribute('srcset'); img.src = src; }, art.cover);
      await page.locator('.blog-cover img').evaluate(img => img.decode());
      await frame.screenshot({ path: path.join(output, `${art.slug}-cover-${label}-original.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(report.imageErrors ?? [], []);
  report.checks.push('Mobile/desktop journal and article layouts; existing crops; exact alt and credit text; licensed original URL retained; no page errors or horizontal overflow');
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ measurements: report.measurements.map(({ label, slug, width, bytes, reductionPercent, browserEncodedBytes }) => ({ label, slug, width, bytes, reductionPercent, browserEncodedBytes })), checks: report.checks }, null, 2));
} finally {
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(output, 'server.log'), logs);
  await browser?.close(); app.kill(); await backend.close();
}
