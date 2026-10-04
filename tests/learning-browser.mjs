import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// Run against a started production build. No writes to external services.
const origin = process.env.DESIGN_BASE_URL || 'http://localhost:3105';
const output = process.env.DESIGN_EVIDENCE_DIR || path.join(os.tmpdir(), 'saint-learning-evidence');
const key = 'saint-discovery:quiz-result:v1';
const saved = { version: 1, slug: 'ignatius-of-loyola', gender: 'Male', scores: { contemplative: 8631, charitable: 7429, intellectual: 6357, courageous: 5239, joyful: 4127, mystical: 3019 } };
const routes = ['/resources/reading', '/saints/ignatius-of-loyola', '/saints/peter-faber', '/saints/francis-of-assisi', '/saints/catherine-of-siena', '/editorial-policy', '/quiz/results/ignatius-of-loyola'];
const report = { origin, checkedAt: new Date().toISOString(), localCssPreview: false, pages: [], interactions: [], errors: [] };
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
const context = await browser.newContext({ reducedMotion: 'reduce', timezoneId: 'America/Chicago' });
await context.route('**/*', route => ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.continue() : route.abort());
const page = await context.newPage();
page.on('pageerror', error => report.errors.push(error.message));
const visit = async route => {
  const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
  assert.equal(response.status(), 200, route);
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
};
const learning = () => page.locator('section[aria-labelledby="result-learning-title"]');
async function checkPage(name, label) {
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  const style = await page.locator('body').evaluate(element => {
    const computed = getComputedStyle(element);
    return { background: computed.backgroundColor, color: computed.color, font: computed.fontFamily, overflow: document.documentElement.scrollWidth > innerWidth };
  });
  const violations = scan.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
  report.pages.push({ name, label, url: page.url(), style, violations });
  await page.screenshot({ path: path.join(output, `learning-${name}-${label}.png`) });
  assert.equal(style.background, 'rgb(12, 28, 42)', `${name}: navy canvas`);
  assert.equal(style.color, 'rgb(250, 246, 235)', `${name}: cream text`);
  assert.match(style.font, /Source Sans 3/, `${name}: shared quiz type`);
  assert.equal(style.overflow, false, `${name} ${label}: overflow`);
  assert.deepEqual(violations, [], `${name} ${label}: accessibility`);
}
async function assertScoresUnchanged() {
  assert.deepEqual(await page.evaluate(storageKey => JSON.parse(sessionStorage.getItem(storageKey)), key), saved);
  for (const [trait, score] of Object.entries(saved.scores)) {
    assert.equal(await page.getByRole('meter', { name: trait, exact: true }).getAttribute('aria-valuenow'), String(score));
  }
}

try {
  for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await visit('/resources/reading');
    await page.evaluate(storageKey => sessionStorage.removeItem(storageKey), key);
    for (const route of routes) {
      await visit(route);
      if (route === '/resources/reading') {
        assert.equal(await page.locator('section[id^="path-"]').count(), 4);
        const links = await page.locator('section[id^="path-"] h3 a').evaluateAll(items => items.map(item => item.getAttribute('href')));
        assert.equal(links.length, 8);
        assert.equal(new Set(links).size, 8, 'Eight distinct profile reading guides');
        for (const section of await page.locator('section[id^="path-"]').all()) assert.equal(await section.locator('h3 a').count(), 2);
      }
      if (route.startsWith('/saints/')) {
        await page.locator('#reading-guide').waitFor();
        const sources = page.locator('#sources');
        assert((await sources.locator(':scope > p').first().innerText()).length > 100, 'Substantive source context');
        assert.match(await sources.innerText(), /AI-assisted comparison, not independent human or ecclesiastical approval/);
        assert((await sources.locator('ul a[href^="https://"]').count()) > 0, 'Followable cited sources');
        const correction = new URL(await sources.getByRole('link', { name: 'Suggest a correction to this biography' }).getAttribute('href'));
        assert.equal(correction.protocol, 'mailto:');
        assert.equal(correction.pathname, 'hello@saintdiscoveryquiz.com');
        assert(correction.searchParams.get('subject').startsWith('Correction: '));
        assert(correction.searchParams.get('body').includes(route));
        assert(correction.searchParams.get('body').includes('Suggested correction and supporting source:'));
        await sources.getByText('What the recorded review covers', { exact: true }).click();
        await sources.getByText(/A source list helps you check an account/).waitFor();
      }
      if (route === '/editorial-policy') {
        assert.match(await page.locator('main').innerText(), /not a fresh fact-check of every directory entry/);
        assert.match(await page.locator('main').innerText(), /AI tools assist/);
        assert.equal(await page.locator('main a[href="mailto:hello@saintdiscoveryquiz.com?subject=Content%20correction"]').count(), 1);
        assert.equal(await page.locator('main a[href="mailto:hello@saintdiscoveryquiz.com?subject=Qualified%20content%20review"]').count(), 1);
      }
      if (route.startsWith('/quiz/results/')) {
        await learning().waitFor();
        assert.equal(await learning().locator('ol > li').count(), 3);
        assert.equal(await page.getByRole('meter').count(), 0);
        assert.equal(await page.getByRole('heading', { name: 'Your spiritual profile' }).count(), 0);
      }
      await checkPage(route.slice(1).replaceAll('/', '-'), label);
    }

    // Exercise actual header navigation using keyboard activation on both sizes.
    await visit('/editorial-policy');
    if (label === 'desktop') {
      const guides = page.getByRole('button', { name: 'Guides', exact: true });
      await guides.focus();
      await page.keyboard.press('Enter');
      assert.equal(await guides.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').getAttribute('href'), '/resources/reading');
    } else {
      const menu = page.getByRole('button', { name: 'Open menu', exact: true });
      await menu.focus();
      await page.keyboard.press('Enter');
      const link = page.locator('#mobile-nav').getByRole('link', { name: /Guided reading/ });
      await link.waitFor();
      await link.focus();
    }
    await page.keyboard.press('Enter');
    await page.waitForURL('**/resources/reading');
    report.interactions.push(`${label}: header Guided reading keyboard navigation`);

    // Seed a valid saved result in this tab, without answering or logging a quiz.
    await page.evaluate(({ storageKey, value }) => sessionStorage.setItem(storageKey, JSON.stringify(value)), { storageKey: key, value: saved });
    await visit('/quiz');
    await learning().waitFor();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.result-layout')).opacity === '1');
    await assertScoresUnchanged();
    await checkPage('personal-result', label);
    await learning().locator('a[href="/saints/ignatius-of-loyola#reading-guide"]').click();
    await page.waitForURL('**/saints/ignatius-of-loyola#reading-guide');
    await page.locator('#reading-guide').waitFor();
    await page.getByRole('link', { name: /Back to my result/ }).click();
    await page.waitForURL('**/quiz');
    await learning().waitFor();
    await assertScoresUnchanged();
    report.interactions.push(`${label}: saved personal result → tailored guide → back retains exact six scores`);

    // A public result must remain public even with personal scores in this tab.
    await visit('/quiz/results/ignatius-of-loyola');
    assert.equal(await page.getByRole('meter').count(), 0);
    const sharedText = await page.locator('main').innerText();
    for (const score of Object.values(saved.scores)) assert(!sharedText.includes(String(score)), `Personal score ${score} leaked to shared page`);
    assert(!(await page.content()).includes(JSON.stringify(saved.scores)), 'Serialized personal scores leaked to shared HTML');
    assert(!page.url().includes('?'), 'Public match needs no private score query');
    await visit('/quiz/results/francis-xavier');
    const fallback = learning().getByRole('link', { name: 'Choose a response to the story', exact: true });
    assert.equal(await fallback.getAttribute('href'), '/saints/francis-xavier#reflection');
    await checkPage('shared-result-without-tailored-guide', label);
    await fallback.click();
    await page.waitForURL('**/saints/francis-xavier#reflection');
    await page.locator('#reflection').waitFor();
    report.interactions.push(`${label}: shared scores absent; non-guide result reaches existing reflection section`);
  }
  const unknown = await context.request.get(origin + '/quiz/results/not-a-real-saint-learning-test');
  assert.equal(unknown.status(), 404, 'Unknown public match must be 404');
  report.interactions.push('Unknown shared result returns HTTP 404');
  assert.deepEqual(report.errors, [], 'Browser exceptions');
} catch (error) {
  report.failure = error.stack || String(error);
  throw error;
} finally {
  fs.writeFileSync(path.join(output, 'learning-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
