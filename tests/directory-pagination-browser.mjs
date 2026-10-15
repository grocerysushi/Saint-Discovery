import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { parse } from 'parse5';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { loadTs } from './load-ts.mjs';

const saints = await loadTs('lib/saints.ts').getAllSaints();
const { getDirectoryPage } = loadTs('lib/directory-page.ts');
const output = path.resolve(process.env.DIRECTORY_EVIDENCE_DIR || 'research/directory-pagination-2026-10-14');
await fs.mkdir(output, { recursive: true });
const probe = http.createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env: { ...process.env, SAINT_BUILD_DIR: process.env.SAINT_BUILD_DIR || '.next-daily/directory-pagination-build' },
  windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = ''; app.stdout.on('data', data => { logs += data; }); app.stderr.on('data', data => { logs += data; });
let browser;
const report = { checkedAt: new Date().toISOString(), html: [], browser: [], checks: [] };
const attrs = node => Object.fromEntries((node.attrs ?? []).map(attr => [attr.name, attr.value]));
const nodes = node => [node, ...(node.childNodes ?? []).flatMap(nodes)];
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(text).join('');
const inspectHtml = async url => {
  const response = await fetch(origin + url, { headers: { 'user-agent': 'Twitterbot' } });
  const html = await response.text();
  const tree = nodes(parse(html));
  const cards = tree.filter(node => attrs(node).class === 'catalogue-entry').map(node => attrs(node).href.split('/').at(-1));
  const canonical = tree.find(node => attrs(node).rel === 'canonical');
  const robots = tree.find(node => attrs(node).name === 'robots');
  const schema = tree.filter(node => node.tagName === 'script' && attrs(node).type === 'application/ld+json').flatMap(node => JSON.parse(text(node))).find(item => item['@type'] === 'CollectionPage');
  return { html, tree, cards, schema, status: response.status, canonical: attrs(canonical ?? {}).href, robots: attrs(robots ?? {}).content };
};
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await fetch(origin + '/robots.txt')).ok) { ready = true; break; } } catch { /* Startup */ }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert.ok(ready, logs);
  const first = getDirectoryPage(saints, {});
  const all = [];
  for (let number = 1; number <= first.pages; number++) {
    const url = number === 1 ? '/resources' : `/resources?page=${number}`;
    const result = await inspectHtml(url);
    const expected = getDirectoryPage(saints, number === 1 ? {} : { page: String(number) });
    assert.equal(result.status, 200, url);
    assert.deepEqual(result.cards, Array.from(expected.saints, saint => saint.slug), url);
    assert.equal(result.canonical, `https://www.saintdiscoveryquiz.com${url}`);
    assert.doesNotMatch(result.robots, /noindex/);
    assert.equal(result.schema.mainEntity.itemListElement.length, result.cards.length);
    assert.equal(result.schema.mainEntity.itemListElement[0].position, expected.offset + 1);
    if (number < first.pages) assert.ok(result.tree.some(node => attrs(node).rel === 'next' && attrs(node).href === `/resources?page=${number + 1}`));
    if (number > 1) assert.ok(result.tree.some(node => attrs(node).rel === 'prev'));
    assert.doesNotMatch(result.html, /trait_contemplative|trait_mystical/);
    all.push(...result.cards);
    report.html.push({ url, status: result.status, cards: result.cards.length, decodedBytes: Buffer.byteLength(result.html), computedGzipBytes: gzipSync(result.html).length });
    if (number === 1) await fs.writeFile(path.join(output, 'directory-server.html'), result.html);
  }
  assert.equal(new Set(all).size, saints.length);
  const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
  for (const saint of saints) assert.ok(sitemap.includes(`/saints/${saint.slug}</loc>`), saint.slug);
  for (const [url, params] of [['/resources?q=francis', { q: 'francis' }], ['/resources?q=francis&page=2', { q: 'francis', page: '2' }], ['/resources?gender=Female', { gender: 'Female' }], ['/resources?q=Th%C3%A9r%C3%A8se&gender=Female&month=October', { q: 'Thérèse', gender: 'Female', month: 'October' }]]) {
    const result = await inspectHtml(url);
    const expected = getDirectoryPage(saints, params);
    assert.equal(result.status, 200);
    assert.deepEqual(result.cards, Array.from(expected.saints, s => s.slug), url);
    assert.match(result.robots, /noindex/);
    if (params.q === 'francis' && !params.page) await fs.writeFile(path.join(output, 'francis-server.html'), result.html);
  }
  for (const url of ['/resources?page=0', '/resources?page=999', '/resources?page=abc', '/resources?q=francis&page=3']) assert.equal((await inspectHtml(url)).status, 404, url);
  const empty = await inspectHtml('/resources?q=zzzz-no-such-saint');
  assert.equal(empty.status, 200); assert.equal(empty.cards.length, 0); assert.match(empty.html, /No saints match/);
  assert.ok(report.html[0].decodedBytes < 350000, 'First response must be substantially smaller than the 2.34MB baseline');
  report.checks.push(`All ${saints.length} saints reached once across ${first.pages} sequential server pages and retained in sitemap; filtered SSR, canonicals, structured data, empty/invalid pages`);
  const daily = await fetch(origin + '/api/saint-of-day?date=09-30&directory=1');
  const dailyText = await daily.text();
  assert.equal(daily.status, 200); assert.ok(dailyText.length < 50000); assert.ok(JSON.parse(dailyText).saints.some(s => s.slug === 'jerome'));
  assert.doesNotMatch(dailyText, /"(?:trait_contemplative|feast_day|prayer)":/);
  assert.equal((await fetch(origin + '/api/saint-of-day?date=99-99&directory=1')).status, 400);
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'America/Chicago', reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) return route.abort();
    if (/googletagmanager|google-analytics/.test(route.request().url())) return route.abort();
    return route.continue();
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const settled = async () => { await page.locator('.catalogue-results[aria-busy="false"]').waitFor(); };
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin + '/resources'); await settled();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.catalogue-entry').count(), 36);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(scan.violations.map(v => v.id), [], `Accessibility at ${width}px`);
    const dom = await page.locator('*').count(); assert.ok(dom < 2000);
    report.browser.push({ width, cards: 36, domElements: dom, accessibilityViolations: scan.violations.length });
    await page.screenshot({ path: path.join(output, `directory-${width}.png`) });
  }
  await page.goto(origin + '/resources?q=francis'); await settled();
  assert.match(await page.locator('.directory-count').textContent(), /61 of 825 saints/);
  await page.getByRole('link', { name: 'Next →', exact: true }).click();
  await page.waitForURL('**/resources?q=francis&page=2'); await settled();
  assert.equal(await page.locator('.catalogue-entry').count(), 25);
  const page2 = page.url(); const firstSlug = await page.locator('.catalogue-entry').first().getAttribute('href');
  await page.locator('.catalogue-entry').first().click(); await page.waitForURL('**/saints/**');
  await page.goBack(); await settled(); assert.equal(page.url(), page2);
  assert.equal(await page.locator('.catalogue-entry').first().getAttribute('href'), firstSlug);
  await page.reload(); await settled(); assert.equal(await page.locator('.catalogue-entry').count(), 25);
  await page.getByLabel('Women and men', { exact: true }).selectOption('Female');
  await page.waitForURL('**/resources?q=francis&gender=Female'); await settled();
  assert.equal(new URL(page.url()).searchParams.has('page'), false);
  await page.goBack(); await settled(); assert.equal(page.url(), page2); assert.equal(await page.getByLabel('Women and men', { exact: true }).inputValue(), '');
  await page.getByRole('link', { name: 'Clear all filters', exact: true }).click();
  await page.waitForURL('**/resources'); await settled();
  assert.equal(await page.locator('#saint-search').evaluate(el => el === document.activeElement), true);
  await page.getByLabel('Search the directory', { exact: true }).fill('Thérèse');
  await page.waitForURL('**/resources?q=Th%C3%A9r%C3%A8se'); await settled();
  assert.equal(await page.getByLabel('Search the directory', { exact: true }).inputValue(), 'Thérèse');
  assert.equal(await page.locator('#saint-search').evaluate(el => el === document.activeElement), true);
  await page.getByLabel('Feast month', { exact: true }).selectOption('October'); await page.waitForURL('**/resources?q=Th%C3%A9r%C3%A8se&month=October'); await settled();
  assert.equal(await page.locator('.catalogue-entry').count(), 1);
  await page.getByLabel('Search the directory', { exact: true }).fill('zzzz-no-such-saint');
  await page.getByRole('heading', { name: 'No saints match this search.' }).waitFor();
  await page.getByRole('link', { name: 'Show all saints', exact: true }).click(); await page.waitForURL('**/resources'); await settled();
  assert.equal(await page.locator('.catalogue-entry').count(), 36);
  // A later keystroke must survive a slower response to the earlier query.
  await page.route('**/resources?*', async route => {
    if (new URL(route.request().url()).searchParams.get('q') === 'fra') await new Promise(resolve => setTimeout(resolve, 650));
    await route.continue();
  });
  const earlierQuery = page.waitForRequest(request => new URL(request.url()).pathname === '/resources' && new URL(request.url()).searchParams.get('q') === 'fra');
  await page.getByLabel('Search the directory', { exact: true }).fill('fra');
  await earlierQuery;
  await page.getByLabel('Search the directory', { exact: true }).fill('francis');
  await page.waitForURL('**/resources?q=francis'); await settled();
  assert.equal(await page.getByLabel('Search the directory', { exact: true }).inputValue(), 'francis');
  assert.match(await page.locator('.directory-count').textContent(), /61 of 825 saints/);
  assert.equal(await page.locator('#saint-search').evaluate(el => el === document.activeElement), true);
  await page.unrouteAll({ behavior: 'wait' });
  await page.getByLabel('Search the directory', { exact: true }).fill('Saint ');
  await page.waitForURL('**/resources?q=Saint'); await settled();
  assert.equal(await page.getByLabel('Search the directory', { exact: true }).inputValue(), 'Saint ', 'Server normalization must preserve a space before the next word');
  await page.getByLabel('Search the directory', { exact: true }).pressSequentially('Peter');
  await page.waitForURL('**/resources?q=Saint+Peter'); await settled();
  assert.equal(await page.getByLabel('Search the directory', { exact: true }).inputValue(), 'Saint Peter');
  report.checks.push('Delayed search responses do not lose subsequent keystrokes or search focus');
  report.checks.push('Mobile/desktop accessibility; query + page reload; biography/back; filter Back restoration; page reset after refinement; accented live search retains focus; empty/reset');
  const native = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await native.route('**/*', route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
  const noJs = await native.newPage();
  await noJs.goto(origin + '/resources', { waitUntil: 'domcontentloaded' });
  await noJs.waitForLoadState('load');
  await noJs.getByLabel('Search the directory', { exact: true }).fill('francis');
  await noJs.getByLabel('Women and men', { exact: true }).selectOption('Male');
  await Promise.all([
    noJs.waitForURL(url => url.searchParams.get('q') === 'francis' && url.searchParams.get('gender') === 'Male', { waitUntil: 'domcontentloaded' }),
    noJs.getByRole('button', { name: 'Search', exact: true }).click({ force: true, noWaitAfter: true }),
  ]);
  assert.equal(new URL(noJs.url()).searchParams.get('q'), 'francis');
  assert.equal(new URL(noJs.url()).searchParams.get('gender'), 'Male');
  assert.ok(await noJs.locator('.catalogue-entry').count() <= 36);
  await Promise.all([
    noJs.waitForURL(url => url.searchParams.get('page') === '2', { waitUntil: 'domcontentloaded' }),
    noJs.getByRole('link', { name: 'Next →', exact: true }).click({ noWaitAfter: true }),
  ]);
  assert.equal(new URL(noJs.url()).searchParams.get('page'), '2');
  assert.equal(new URL(noJs.url()).searchParams.get('q'), 'francis');
  report.checks.push('Search, filters and subsequent-page links work without JavaScript, including mobile filter visibility');
  assert.deepEqual(errors, []);
  report.success = true;
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ firstPage: report.html[0], lastPage: report.html.at(-1), browser: report.browser, checks: report.checks }, null, 2));
} finally {
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(output, 'server.log'), logs);
  await browser?.close(); app.kill();
}
