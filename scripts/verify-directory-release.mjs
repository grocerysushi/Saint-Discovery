// Read-only HTTP verification. Use after confirming the deployment's Git SHA.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { loadTs } from '../tests/load-ts.mjs';
const origin=process.argv[2];
if (!origin || !/^https:\/\/[a-z0-9.-]+$/i.test(origin)) throw new Error('Usage: node scripts/verify-directory-release.mjs https://www.saintdiscoveryquiz.com');
const {getAllSaints}=loadTs('lib/saints.ts');
const {reviews,isPublishedSaintSlug}=loadTs('lib/saint-reviews.ts');
const saints=await getAllSaints();
const additions=JSON.parse(fs.readFileSync(new URL('../lib/data/directory-additions.json',import.meta.url)));
const decode=value=>value.replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const get=async route=>{
  const response=await fetch(origin+route,{signal:AbortSignal.timeout(30000),redirect:'manual'});
  return {status:response.status,body:await response.text()};
};
const sitemap=await get('/sitemap.xml');
const directory=await get('/resources');
assert.equal(sitemap.status,200);assert.equal(directory.status,200);
const urls=[...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.filter(url=>url.startsWith(origin+'/saints/')).length,saints.length);
for(const s of saints) {
  assert.ok(urls.includes(`${origin}/saints/${s.slug}`),s.slug);
  assert.ok(directory.body.includes(`href="/saints/${s.slug}"`),s.slug);
}
const excluded=Object.keys(reviews).filter(slug=>!isPublishedSaintSlug(slug));
for(const slug of excluded) assert.ok(!urls.includes(`${origin}/saints/${slug}`),slug);
const jobs=[
  ...additions.map(entry=>async()=>{
    const page=await get(`/saints/${entry.saint.slug}`);
    assert.equal(page.status,200,entry.saint.slug);
    assert.ok(page.body.includes(`rel="canonical" href="${origin}/saints/${entry.saint.slug}"`));
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(page.body));
    const visible=decode(page.body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
    for(const paragraph of entry.review.biography) assert.ok(visible.includes(paragraph),`${entry.saint.slug}: live biography differs from reviewed content`);
    for(const source of entry.review.sources) assert.ok(page.body.includes(`href="${source.url}"`),source.url);
    assert.ok(page.body.includes('A Catholic liturgical calendar date has not yet been verified'));
  }),
  ...excluded.map(slug=>async()=>assert.equal((await get(`/saints/${slug}`)).status,404,slug)),
  ...['anne-catherine-emmerich','all-souls','andrew-bobola'].map(slug=>async()=>assert.equal((await get(`/quiz/results/${slug}`)).status,404,slug))
];
let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<jobs.length){const job=jobs[next++];await job();}}));
console.log(JSON.stringify({origin,publishedCatholicRecords:saints.length,newUniqueIndividuals:additions.length,newPagesChecked:additions.length,excludedRoutesChecked:excluded.length,quizExclusionsChecked:3,sitemap:'passed',directory:'passed',checkedAt:new Date().toISOString()},null,2));
