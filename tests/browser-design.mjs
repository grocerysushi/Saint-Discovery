import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// Run against a started local production build. External writes are blocked.
const origin = process.env.DESIGN_BASE_URL || 'http://localhost:3100';
const output = process.env.DESIGN_EVIDENCE_DIR || path.join(os.tmpdir(), 'saint-design-evidence');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
const report = { origin, checkedAt: new Date().toISOString(), pages: [], interactions: [] };
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
await context.route('**/*', route => {
  const request = route.request();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) return route.abort();
  return route.continue();
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const visit = async route => {
  await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
  await page.locator('h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
};
const check = (name) => report.interactions.push(name);
try {
  for (const [label, width, height] of [['desktop',1440,1000],['mobile',390,844]]) {
    await page.setViewportSize({ width, height });
    for (const [name, route] of [['home','/'],['directory','/resources'],['profile','/saints/therese-of-lisieux'],['korean-profile','/saints/columba-kim-hyo-im']]) {
      await visit(route);
      if (name === 'directory') await page.locator('#catalogue-filter-fields').waitFor({state:width > 1000 ? 'visible' : 'hidden'});
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      await page.screenshot({ path: path.join(output, `${name}-${label}.png`), fullPage: false });
      report.pages.push({ name, label, horizontalOverflow, violations: scan.violations.map(v => ({ id:v.id, nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})) })) });
      assert.equal(horizontalOverflow, false, `${name} ${label}: horizontal overflow`);
      assert.deepEqual(scan.violations.map(v => v.id), [], `${name} ${label}: accessibility violations`);
    }
  }
  await page.setViewportSize({ width:1440, height:1000 });
  await visit('/');
  assert.equal(await page.locator('.home-artwork img').evaluate(img => img.complete && img.naturalWidth > 0), true);
  await page.getByLabel('Who would you like to discover?').fill('Korea');
  await page.getByRole('button', { name:'Search saints', exact:true }).click();
  await page.waitForURL('**/resources?q=Korea');
  await page.waitForFunction(() => document.querySelector('#saint-search')?.value === 'Korea');
  await page.getByLabel('Women and men', { exact:true }).selectOption('Female');
  await page.waitForFunction(() => location.search.includes('gender=Female'));
  const filteredCount = await page.locator('.catalogue-list li').count();
  assert(filteredCount >= 27 && filteredCount < 487);
  const searchUrl = page.url();
  await page.locator('.catalogue-entry').first().click();
  await page.waitForURL('**/saints/**');
  await page.goBack();
  await page.waitForFunction(() => document.querySelector('#directory-gender')?.value === 'Female');
  assert.equal(page.url(), searchUrl);
  assert.equal(await page.locator('.catalogue-list li').count(), filteredCount);
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#directory-gender')?.value === 'Female');
  assert.equal(await page.locator('.catalogue-list li').count(), filteredCount);
  check('Home search; combined country text/gender filters; profile/back and reload preserve filters');
  await page.getByRole('button', {name:'Clear all filters', exact:true}).click();
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-list li').length === 487);
  assert.equal(await page.locator('#saint-search').evaluate(el=>el === document.activeElement), true);
  await page.getByLabel('Search the directory', {exact:true}).fill('zzzz-no-such-saint-zzzz');
  await page.getByRole('heading', {name:'No saints match this search.'}).waitFor();
  await page.getByRole('button', {name:'Show all saints'}).click();
  await page.waitForFunction(() => document.querySelectorAll('.catalogue-list li').length === 487);
  check('Empty results, clear all, full 487-entry restoration and search focus');
  const guides = page.getByRole('button', {name:'Guides', exact:true});
  await guides.focus(); await page.keyboard.press('Enter');
  assert.equal(await guides.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Tab');
  assert.match(await page.evaluate(()=>document.activeElement?.textContent), /Journal/);
  await page.keyboard.press('Escape');
  assert.equal(await guides.getAttribute('aria-expanded'), 'false');
  assert.equal(await guides.evaluate(el=>el === document.activeElement), true);
  check('Desktop navigation opens with keyboard, tabs to a link, closes with Escape and returns focus');
  await page.setViewportSize({width:390,height:844});
  const filters = page.getByRole('button', {name:'Filters', exact:true});
  await page.locator('#catalogue-filter-fields').waitFor({state:'hidden'});
  await filters.click();
  await page.getByLabel('Country or region').waitFor({state:'visible'});
  await filters.click();
  await page.locator('#catalogue-filter-fields').waitFor({state:'hidden'});
  const menu = page.getByRole('button', {name:'Open menu',exact:true});
  await menu.click();
  await page.getByRole('navigation', {name:'Mobile',exact:true}).waitFor({state:'visible'});
  await page.keyboard.press('Escape');
  await page.getByRole('navigation', {name:'Mobile',exact:true}).waitFor({state:'hidden'});
  assert.equal(await menu.evaluate(el=>el === document.activeElement), true);
  check('Mobile filters and navigation disclosure; Escape returns focus');
  for (const route of ['/','/resources','/saints/therese-of-lisieux']) {
    await page.setViewportSize({width:320,height:800}); await visit(route);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth), false, `320px overflow: ${route}`);
  }
  check('320px reading and controls do not overflow horizontally');
  await page.setViewportSize({width:390,height:844}); await visit('/quiz');
  await page.getByRole('heading', {name:'What is your gender?', exact:true}).waitFor();
  await page.getByRole('button', {name:/Male/}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.question-options button').length === 4);
  assert.notEqual(await page.locator('h1').textContent(), 'What is your gender?');
  await page.getByRole('button', {name:/Previous question/}).click();
  await page.getByRole('heading', {name:'What is your gender?',exact:true}).waitFor();
  check('Unchanged quiz opening, first four answer choices and previous-question navigation');
  assert.deepEqual(errors, [], 'Browser exceptions');
  report.errors = errors;
} finally {
  fs.writeFileSync(path.join(output,'report.json'), JSON.stringify(report,null,2));
  await browser.close();
}
console.log(JSON.stringify(report,null,2));
