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
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', timezoneId:'America/Chicago' });
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
  if (route === '/quiz') await page.waitForFunction(()=>getComputedStyle(document.querySelector('.question-card')).opacity === '1');
};
const check = (name) => report.interactions.push(name);
try {
  for (const [label, width, height] of [['desktop',1440,1000],['mobile',390,844]]) {
    await page.setViewportSize({ width, height });
    for (const [name, route] of [['home','/'],['directory','/resources'],['profile','/saints/therese-of-lisieux'],['korean-profile','/saints/columba-kim-hyo-im'],['quiz','/quiz']]) {
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
  const getStyle = async selector => page.locator(selector).first().evaluate(el=>{
    const s=getComputedStyle(el); return {color:s.color,background:s.backgroundColor,font:s.fontFamily,radius:s.borderRadius};
  });
  await page.setViewportSize({width:1440,height:1000}); await visit('/quiz');
  const quizPanel=await getStyle('.question-card');
  const quizOption=await getStyle('.option-button');
  assert.equal(quizPanel.background,'rgb(21, 43, 58)');
  assert.equal(quizOption.background,'rgb(12, 28, 42)');
  assert.equal(quizPanel.color,'rgb(250, 246, 235)');
  for(const [route,selector] of [['/','.discovery-copy'],['/resources','.catalogue-entry'],['/saints/therese-of-lisieux','.biography-reading article']]){
    await visit(route); assert.deepEqual(await getStyle(selector),quizPanel,`Shared quiz panel styles: ${route}`);
  }
  check('Home, directory and biography panels match the existing quiz background, text, type and corners');
  for(const [width,height] of [[1440,1000],[390,844]]){
    await page.setViewportSize({width,height}); await visit('/');
    await page.locator('.liturgical-banner[data-calendar-date]').waitFor();
    const siteBackground=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
    await page.locator('.liturgical-details summary').click();
    for(const [date,color] of [['2026-10-02','white'],['2026-10-03','green'],['2026-03-07','violet'],['2026-03-15','violet'],['2026-04-03','red'],['2026-11-02','violet']]){
      await page.getByLabel('Preview calendar date').fill(date);
      await page.locator('.liturgical-banner').filter({hasText:'Calendar preview'}).waitFor();
      assert.equal(await page.locator('.liturgical-banner').getAttribute('data-liturgical-color'),color);
      const scan=await new AxeBuilder({page}).include('.liturgical-banner').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      assert.deepEqual(scan.violations.map(v=>v.id),[],`${date} ${width}: calendar accessibility`);
      assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),siteBackground,'Preview must not recolor site');
      if(date==='2026-03-15') await page.getByText('Rose (optional)',{exact:true}).waitFor();
      if(date==='2026-11-02') await page.getByText('Black',{exact:true}).waitFor();
    }
    await page.getByLabel('Preview calendar date').fill('2028-01-01');
    await page.getByRole('heading',{name:'Calendar unavailable for this date'}).waitFor();
    assert.equal(await page.locator('.liturgical-swatch').count(),0);
    await page.getByRole('button',{name:'Return to today'}).click();
    assert.equal(await page.getByText('Calendar preview',{exact:true}).count(),0);
    await page.locator('.liturgical-details summary').click();
    await page.screenshot({path:path.join(output,`calendar-${width}.png`)});
  }
  check('All six calendar colors, optional rose/black, preview/reset, unavailable year and isolated site palette; 12 additional accessibility scans');
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
  assert.match(await page.evaluate(()=>document.activeElement?.textContent), /Guided reading/);
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
  const clockContext=await browser.newContext({timezoneId:'America/Chicago',viewport:{width:390,height:844}});
  await clockContext.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())&&!r.request().url().includes('litcal.johnromanodorazio.com')?r.continue():r.abort());
  const clockPage=await clockContext.newPage();
  clockPage.on('pageerror',e=>errors.push(e.message));
  await clockPage.clock.install({time:new Date('2026-10-02T04:59:50Z')});
  await clockPage.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await clockPage.locator('.liturgical-banner[data-calendar-date="2026-10-01"]').waitFor();
  await clockPage.clock.fastForward(12000);
  await clockPage.locator('.liturgical-banner[data-calendar-date="2026-10-02"]').waitFor();
  await clockPage.getByRole('heading',{name:'The Holy Guardian Angels',exact:true}).waitFor();
  await clockPage.clock.setSystemTime(new Date('2027-01-01T05:59:50Z'));
  await clockPage.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await clockPage.locator('.liturgical-banner[data-calendar-date="2026-12-31"]').waitFor();
  await clockPage.clock.fastForward(12000);
  await clockPage.locator('.liturgical-banner[data-calendar-date="2027-01-01"]').waitFor();
  await clockPage.clock.setSystemTime(new Date('2028-01-01T18:00:00Z'));
  await clockPage.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await clockPage.getByRole('heading',{name:'Calendar unavailable for this date'}).waitFor();
  await clockContext.close();
  check('Actual browser local-midnight and year-rollover updates; sleep catch-up and unavailable future year with calendar API blocked');
  assert.deepEqual(errors, [], 'Browser exceptions');
  report.errors = errors;
} finally {
  fs.writeFileSync(path.join(output,'report.json'), JSON.stringify(report,null,2));
  await browser.close();
}
console.log(JSON.stringify(report,null,2));
