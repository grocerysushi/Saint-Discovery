import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const origin=process.env.DESIGN_BASE_URL || 'http://localhost:3100';
const output=process.env.DESIGN_EVIDENCE_DIR || path.join(os.tmpdir(),'saint-design-evidence');
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
const context=await browser.newContext({reducedMotion:'reduce',timezoneId:'America/Chicago'});
await context.route('**/*',r=>['GET','HEAD','OPTIONS'].includes(r.request().method())?r.continue():r.abort());
const page=await context.newPage();
const routes=['/about','/privacy','/editorial-policy','/confirmation-saint-guide','/resources/teachers','/patron-saint-of','/patron-saint-of/students','/saint-of-day','/quiz/results/therese-of-lisieux','/blog','/confirm','/subscribed','/unsubscribe','/unsubscribed'];
const previewCss=process.env.DESIGN_PREVIEW_CSS ? fs.readFileSync(process.env.DESIGN_PREVIEW_CSS,'utf8') : null;
const report={origin,localCssPreview:!!previewCss,checkedAt:new Date().toISOString(),pages:[],errors:[]};
page.on('pageerror',e=>report.errors.push(e.message));
try {
  for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
    await page.setViewportSize({width,height});
    for(const route of routes){
      const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
      await page.locator('h1').first().waitFor(); await page.evaluate(()=>document.fonts.ready);
      if(previewCss)await page.addStyleTag({content:previewCss});
      const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      const style=await page.locator('body').evaluate(el=>{const s=getComputedStyle(el);return{background:s.backgroundColor,color:s.color,font:s.fontFamily,overflow:document.documentElement.scrollWidth>innerWidth};});
      report.pages.push({route,label,status:response.status(),style,violations:scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
      await page.screenshot({path:path.join(output,`public-${route.slice(1).replaceAll('/','-')}-${label}.png`)});
      if(route==='/blog' && label==='desktop'){
        const article=await page.locator('a[href^="/blog/"]').evaluateAll(links=>links.map(a=>a.getAttribute('href')).find(h=>h&&!h.endsWith('feed.xml')));
        if(article&&!routes.includes(article))routes.push(article);
      }
    }
  }
} finally {fs.writeFileSync(path.join(output,'public-report.json'),JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report,null,2));
for(const p of report.pages){
  assert.equal(p.status,200,p.route);
  assert.equal(p.style.background,'rgb(12, 28, 42)',p.route);
  assert.equal(p.style.color,'rgb(250, 246, 235)',p.route);
  assert.match(p.style.font,/Source Sans 3/,p.route);
  assert.equal(p.style.overflow,false,`${p.route} ${p.label} overflow`);
  assert.deepEqual(p.violations,[],`${p.route} ${p.label} accessibility`);
}
assert.deepEqual(report.errors,[],'Browser exceptions');
