import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const output=process.env.TRANSLATION_EVIDENCE_DIR||'research/translation-a11y-2026-10-15';
await fs.mkdir(output,{recursive:true});
const probe=http.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');
const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const origin=`http://127.0.0.1:${port}`;
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{
  env:{...process.env,SAINT_BUILD_DIR:process.env.SAINT_BUILD_DIR||'.next-daily/translation-a11y-build'},windowsHide:true,stdio:['ignore','pipe','pipe'],
});
let logs='',browser;app.stdout.on('data',d=>{logs+=d;});app.stderr.on('data',d=>{logs+=d;});
const report={checkedAt:new Date().toISOString(),native:[],proxyFixtures:[],limits:'Proxy cases are locally served translated HTML fixtures, not live Google translation or spoken screen-reader testing.'};
try{
  let ready=false;
  for(let i=0;i<100;i++){try{if((await fetch(origin+'/robots.txt')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
  assert.ok(ready,logs);
  browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
  const context=await browser.newContext({reducedMotion:'reduce',timezoneId:'America/Chicago'});
  await context.route('**/*',route=>route.request().url().startsWith(origin+'/')&&['GET','HEAD'].includes(route.request().method())?route.continue():route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let bootstrap,englishIslands;
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(origin+'/?_x_tr_tl=es',{waitUntil:'domcontentloaded'});
    const toggle=page.getByRole('button',{name:'Language: English'});await toggle.waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'),'en','Native query parameters cannot relabel English');
    const colors=page.getByRole('group',{name:'Liturgical color'});await colors.waitFor();
    assert.ok((await colors.innerText()).trim());
    await toggle.focus();await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('data-language-choice'),'en');
    await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('data-language-choice'),'es');
    assert.equal(await page.locator(':focus').getAttribute('lang'),'es');
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.ok(await toggle.evaluate(el=>el===document.activeElement));
    await page.keyboard.press('Enter');
    const more=page.locator('.language-options summary');await more.focus();await page.keyboard.press('Enter');
    assert.equal(await more.locator('..').getAttribute('open'),'');
    await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('data-language-choice'),'it');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Tab');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
    await toggle.focus();await page.keyboard.press('Enter');
    const menu=page.locator('.language-switcher');assert.equal(await menu.getAttribute('lang'),'en');assert.equal(await menu.getAttribute('dir'),'ltr');
    for(const code of ['es','de','fr','ar','zh-CN','zh-TW']){
      const link=page.locator(`[data-language-choice="${code}"]`);
      assert.equal(await link.getAttribute('lang'),code);assert.equal(await link.getAttribute('dir'),'auto');
      if(code==='es')assert.equal(new URL(await link.getAttribute('href')).searchParams.get('tl'),'es');
    }
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    assert.deepEqual(scan.violations,[]);
    assert.ok(!scan.incomplete.some(v=>v.id==='aria-prohibited-attr'&&v.nodes.some(n=>n.target.includes('.liturgical-colors'))));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.screenshot({path:`${output}/native-${width}.png`});
    bootstrap=await page.locator('#translation-document-language').textContent();
    assert.ok(bootstrap?.includes('syncLanguage'));
    englishIslands=await page.locator('.brand.notranslate, .language-switcher').evaluateAll(elements=>elements.map(el=>el.outerHTML).join(''));
    const arrowContrast=await page.locator('.btn-primary[href="/quiz"] > span[aria-hidden="true"], .home-daily-feature-action > span[aria-hidden="true"]').evaluateAll(elements=>{
      const rgb=value=>value.match(/[\d.]+/g)?.map(Number)??[];
      const luminance=color=>color.slice(0,3).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
      return elements.map(el=>{
        const foreground=getComputedStyle(el).color;let parent=el,background='';
        while(parent){const candidate=getComputedStyle(parent).backgroundColor;if(rgb(candidate)[3]!==0){background=candidate;break;}parent=parent.parentElement;}
        const a=luminance(rgb(foreground)),b=luminance(rgb(background));
        return {text:el.textContent,foreground,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),decorative:el.getAttribute('aria-hidden')==='true'};
      });
    });
    assert.equal(arrowContrast.length,2);for(const arrow of arrowContrast)assert.ok(arrow.ratio>=3);
    report.native.push({width,lang:'en',colorRole:'group',keyboard:'Enter, Tab, Escape, focus return, More languages passed',axeViolations:[],arrowContrast,incomplete:scan.incomplete.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});
  }
  await page.goto(origin+'/resources',{waitUntil:'domcontentloaded'});
  const pageCount=page.locator('.catalogue-page-count [lang="en"]');
  assert.match(await pageCount.textContent(),/^1 of [1-9]\d*$/);
  report.directoryEnglishCountMarked=true;
  assert.deepEqual(errors,[],'No new native browser errors');
  const fixtureContext=await browser.newContext();
  // Every request is intercepted locally: no requests to Google or third parties.
  await fixtureContext.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.hostname!=='www-saintdiscoveryquiz-com.translate.goog')return route.abort();
    const samples={es:['¿Qué santo católico eres?','Conoce la vida de los santos.'],ar:['أي قديس كاثوليكي أنت؟','تعرف على القديسين'],fr:['Quel saint catholique êtes-vous ?','Découvrez la vie des saints.'],'zh-CN':['你是哪位天主教圣人？','了解圣人的生活。'],'zh-TW':['你是哪位天主教聖人？','了解聖人的生活。']};
    const [heading,body]=samples[url.searchParams.get('_x_tr_tl')];
    return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head><title>${heading}</title><script>${bootstrap}</script></head><body><main><h1>${heading}</h1><p>${body}</p></main>${englishIslands}</body></html>`});
  });
  const fixture=await fixtureContext.newPage();
  for(const code of ['es','ar','fr','zh-CN','zh-TW']){
    await fixture.goto(`https://www-saintdiscoveryquiz-com.translate.goog/?_x_tr_tl=${code}`);
    assert.equal(await fixture.locator('html').getAttribute('lang'),code);
    assert.equal(await fixture.locator('html').getAttribute('dir'),code==='ar'?'rtl':'ltr');
    await fixture.evaluate(()=>{document.documentElement.lang='en';document.documentElement.dir='ltr';});
    await fixture.waitForFunction(expected=>document.documentElement.lang===expected,code);
    assert.equal(await fixture.locator('.language-switcher').getAttribute('lang'),'en');
    assert.equal(await fixture.locator('.brand').getAttribute('lang'),'en');
    const scan=await new AxeBuilder({page:fixture}).withRules(['html-has-lang','html-lang-valid','valid-lang']).analyze();
    assert.deepEqual(scan.violations,[]);
    report.proxyFixtures.push({code,languageRestoredAfterProviderRewrite:true,englishIslandsPreserved:true});
  }
  report.nativeBrowserErrors=errors;
  await fs.writeFile(`${output}/verification.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({nativeCases:report.native.length,proxyFixtureCases:report.proxyFixtures.length,passed:true}));
}finally{
  await browser?.close();
  if(app.exitCode===null){const ended=once(app,'exit');app.kill();await ended;}
}
