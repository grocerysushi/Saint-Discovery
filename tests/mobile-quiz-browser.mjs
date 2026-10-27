import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import http from'node:http';import{once}from'node:events';import{spawn}from'node:child_process';import{chromium}from'playwright';import AxeBuilder from'@axe-core/playwright';import{loadTs}from'./load-ts.mjs';
const out=path.resolve(process.env.MOBILE_EVIDENCE_DIR||'research/mobile-audit-2026-10-15/local-fixes');await fs.mkdir(out,{recursive:true});
const data=JSON.parse(await fs.readFile('lib/data/quiz.json','utf8')),questions=data.questions.map(q=>({...q,options:data.options.filter(o=>o.question_id===q.id)}));
const{getQuizCandidates}=loadTs('lib/quiz-candidates.ts'),saints=getQuizCandidates();const{matchSaint}=loadTs('lib/scoring.ts');const{normalizeQuizScores}=loadTs('lib/quiz-questions.ts');const{quizProgressScores}=loadTs('lib/quiz-progress.ts');
let origin=process.env.MOBILE_BASE_URL,app,logs='';const report={origin,checkedAt:new Date().toISOString(),pages:[],checks:[],errors:[]};let browser;
try{
if(!origin){const probe=http.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(r=>probe.close(r));origin='http://127.0.0.1:'+port;app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,SAINT_BUILD_DIR:'.next-daily/mobile-fixes-build'}});app.stdout.on('data',d=>logs+=d);app.stderr.on('data',d=>logs+=d);let ready=false;for(let n=0;n<120;n++){try{if((await fetch(origin+'/robots.txt')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}assert(ready,logs);}
report.origin=origin;browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const c=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce',timezoneId:'America/Chicago'});
const prefetch=[];await c.route('**/*',r=>{const q=r.request();if(q.headers()['next-router-prefetch']&&new URL(q.url()).pathname==='/quiz')prefetch.push(q.url());return /google-analytics|googletagmanager/.test(q.url())||!['GET','HEAD','OPTIONS'].includes(q.method())?r.abort():r.continue();});
const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));
for(const width of[320,390,430]){
 await p.setViewportSize({width,height:844});
 for(const route of['/about','/','/resources','/quiz']){
  const r=await p.goto(origin+route,{waitUntil:'networkidle'});assert.equal(r.status(),200);await p.locator('h1').waitFor();await p.evaluate(()=>document.fonts.ready);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  if(route==='/about'){await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForTimeout(500);}
  const metrics=await p.evaluate(()=>({js:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script').map(r=>({url:r.name,encoded:r.encodedBodySize,decoded:r.decodedBodySize})),heading:document.querySelector('h1').innerText}));
  report.pages.push({route,width,...metrics});
  if(route!=='/quiz')assert.equal(prefetch.length,0,'Reading pages must not prefetch quiz');
  for(const js of metrics.js){const text=await(await c.request.get(js.url)).text();assert(!text.includes('alexius-u-se-yong'),'Directory editorial data must stay out of client JavaScript');}
 }
}
report.checks.push('320/390/430 layouts; reading pages never prefetch quiz; no directory-only editorial records in JavaScript');
await p.setViewportSize({width:390,height:844});await p.goto(origin+'/quiz',{waitUntil:'networkidle'});await p.getByRole('button',{name:'Male',exact:true}).click();await p.waitForTimeout(150);
const select=async q=>{const before=await p.locator('h1').innerText();await p.getByText(q.options[0].label,{exact:true}).click();await p.waitForFunction(text=>document.querySelector('h1')?.innerText!==text,before);};
for(let n=0;n<5;n++)await select(questions[n]);
const heading=await p.locator('h1').innerText(),order=await p.locator('.option-button').allInnerTexts(),raw=await p.evaluate(()=>sessionStorage.getItem('saint-discovery:quiz-progress:v1'));assert.equal(JSON.parse(raw).answers.length,5);
await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(text=>document.querySelector('h1')?.innerText===text,heading);assert.equal(await p.locator('h1').innerText(),heading);assert.deepEqual(await p.locator('.option-button').allInnerTexts(),order);
await p.getByRole('button',{name:/Previous question/}).click();await p.waitForFunction(text=>document.querySelector('h1')?.innerText!==text,heading);assert.equal((await p.locator('h1').innerText()),questions[4].text);await select(questions[4]);assert.equal(await p.locator('h1').innerText(),heading);
report.checks.push('Five answers and shuffled option order survive refresh; Back and reselection preserve scores');
await c.setOffline(true);for(let n=5;n<20;n++)await select(questions[n]);assert(await p.locator('.result-layout').isVisible());await c.setOffline(false);
const scores=normalizeQuizScores(quizProgressScores({questions,answerIds:questions.map(q=>q.options[0].id)}),questions),expected=matchSaint(scores,saints.filter(s=>s.gender==='Male'));
const saved=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('saint-discovery:quiz-result:v1')));assert.equal(saved.slug,expected.slug);assert.deepEqual(saved.scores,JSON.parse(JSON.stringify(scores)));assert.equal(await p.evaluate(()=>sessionStorage.getItem('saint-discovery:quiz-progress:v1')),null);
const email=p.locator('input[type=email]');assert.equal(await email.evaluate(e=>getComputedStyle(e).fontSize),'16px');
await p.waitForFunction(()=>getComputedStyle(document.querySelector('.result-layout')).opacity==='1');await p.evaluate(()=>document.fonts.ready);
const scan=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();report.resultAccessibility=scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}));assert.deepEqual(report.resultAccessibility,[]);
await p.screenshot({path:path.join(out,'result-390.png'),fullPage:false});await p.reload({waitUntil:'domcontentloaded'});await p.locator('.result-layout').waitFor();assert(await p.locator('.result-layout').isVisible());await p.locator('.result-primary-story').click();await p.waitForURL('**/saints/**');await p.goBack({waitUntil:'domcontentloaded'});await p.locator('.result-layout').waitFor();assert(await p.locator('.result-layout').isVisible());
report.checks.push('Offline answering produces the unchanged match/profile; completed result recovers after refresh and biography return; email16px; result axe clean');
await p.getByRole('button',{name:/Take the quiz again/}).click();await p.locator('#gender-heading').waitFor();await p.getByRole('button',{name:'Male',exact:true}).click();await p.waitForTimeout(100);await select(questions[0]);await p.getByRole('button',{name:'Start over',exact:true}).click();await p.locator('#gender-heading').waitFor();assert.equal(await p.evaluate(()=>sessionStorage.getItem('saint-discovery:quiz-progress:v1')),null);await p.reload({waitUntil:'domcontentloaded'});assert(await p.locator('#gender-heading').isVisible());
await p.evaluate(()=>sessionStorage.setItem('saint-discovery:quiz-progress:v1','{broken'));await p.reload({waitUntil:'domcontentloaded'});assert(await p.locator('#gender-heading').isVisible());await p.waitForFunction(()=>sessionStorage.getItem('saint-discovery:quiz-progress:v1')===null);
report.checks.push('Start over clears progress/result; malformed saved attempts start safely');
await p.goto(origin,{waitUntil:'networkidle'});await p.locator('.liturgical-details summary').click();const date=p.locator('.liturgical-details input');assert.equal(await date.evaluate(e=>getComputedStyle(e).fontSize),'16px');
await p.getByRole('button',{name:'Open menu',exact:true}).click();assert(await p.locator('#mobile-nav').isVisible());await p.keyboard.press('Escape');assert.equal(await p.locator(':focus').getAttribute('aria-label'),'Open menu');
assert.deepEqual(report.errors,[]);report.passed=true;console.log(JSON.stringify({origin,pages:report.pages.length,checks:report.checks,errors:report.errors,aboutJs:report.pages.filter(x=>x.route==='/about').map(x=>({width:x.width,encoded:x.js.reduce((n,r)=>n+r.encoded,0),decoded:x.js.reduce((n,r)=>n+r.decoded,0)})),passed:report.passed},null,2));
}finally{await browser?.close();app?.kill();await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(report,null,2));await fs.writeFile(path.join(out,'server.log'),logs);}

