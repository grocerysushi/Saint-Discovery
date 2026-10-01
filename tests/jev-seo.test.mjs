import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SITE,publicUrl,extractPage,technicalFindings,makeRequest,validateEvaluation,editorialFindings,fetchPublic,typeSafeRequest,robotsAllows,markdownReport} from '../scripts/lib/jev-seo.mjs';

const fixture=`<!doctype html><html><head><title>Prayer &amp; reflection</title><meta content="A reader's guide &amp; examples" name="description"><link href="${SITE}/blog/prayer" rel="canonical"><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"BlogPosting"}]}</script></head><body><header>Shared header</header><main><header><h1>Prayer &amp; reflection</h1></header><nav><h1>Menu heading</h1><a href="/admin">Admin</a></nav><article><p>Begin with a question.</p><h2>Sources</h2><p>Read <a href="https://www.vatican.va/">the Vatican</a> and <a href="/saints/therese-of-lisieux">Thérèse</a>.</p><div hidden><h2>Hidden heading</h2>Hidden content</div><script>secret application payload</script></article></main><footer>Shared footer</footer></body></html>`;

test('HTML extraction decodes entities, keeps article headers, and excludes navigation and hidden payloads',()=>{
  const page=extractPage(fixture,SITE+'/blog/prayer');
  assert.equal(page.title,'Prayer & reflection');assert.equal(page.description,"A reader's guide & examples");
  assert.deepEqual(page.h1,['Prayer & reflection']);assert(page.text.includes('Begin with a question.'));
  for(const value of ['Shared header','Shared footer','Menu heading','Hidden content','secret application payload'])assert(!page.text.includes(value));
  assert.equal(page.internalLinks.length,1);assert.equal(page.externalLinks.length,1);assert.deepEqual(page.schemaTypes,['BlogPosting']);
  assert.deepEqual(technicalFindings(page),[]);
});

test('public URL boundaries exclude personal/admin routes, query strings, encoded paths and foreign origins',()=>{
  assert.equal(publicUrl('/saints/therese-of-lisieux'),SITE+'/saints/therese-of-lisieux');
  for(const value of ['/admin','/admin/blog','/api/subscriptions','/result','/results/abc','/quiz/results/joseph','/subscribed','/unsubscribed','/confirm','/quiz?email=reader@example.com','/%61dmin','//example.com/','https://www.saintdiscoveryquiz.com@evil.example/'])assert.throws(()=>publicUrl(value));
});

test('page fetching never sends API authorization and refuses off-site redirects',async()=>{
  const calls=[];
  await assert.rejects(fetchPublic('/',async(url,options)=>{calls.push({url,options});return new Response(null,{status:302,headers:{location:'https://example.com/'}});}),/public canonical/);
  assert.equal(calls.length,1);assert.equal(calls[0].options.headers.Authorization,undefined);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'manual');
});

test('robots longest-match rules allow the exceptions and prefer crawler-specific groups',()=>{
  const robots='User-agent: *\nDisallow: /saints/\nAllow: /saints/therese-of-lisieux\n';
  assert(!robotsAllows(robots,SITE+'/saints/joseph'));assert(robotsAllows(robots,SITE+'/saints/therese-of-lisieux'));
  assert(robotsAllows(robots+'User-agent: SaintDiscoverySEOAudit\nAllow: /\n',SITE+'/saints/joseph'));
  assert(!robotsAllows('User-agent: *\nDisallow: /*.xml$\n',SITE+'/blog/sitemap.xml'));
});

test('observed noindex and invalid JSON-LD appear as technical evidence',()=>{
  const page=extractPage(fixture.replace('<meta content=', '<meta name="robots" content="noindex"><meta content=').replace('"@context":"https://schema.org"','broken'),SITE+'/blog/prayer');
  const issues=technicalFindings(page);assert(issues.some(f=>f.issue.includes('noindex')));assert(issues.some(f=>f.issue.includes('JSON-LD')));
});

const responseFor=request=>({model:'jev-1.13.0',answers:Object.fromEntries(Object.entries(request.questions).map(([name,q])=>[name,q.type==='score'?{type:'score',score:3.5,confidence:0.9,probabilities:{'3':0.5,'4':0.5},legend:{}}:{type:'noul',noul:name.startsWith('overlap')?0.05:0.95}])),usage:{input_tokens:1000,output_tokens:30}});

test('typed requests preserve page purpose and response validation rejects missing/malformed answers',()=>{
  const page=extractPage(fixture,SITE+'/quiz'),request=makeRequest(page,[]);
  assert(request.state.page.purpose.includes('interactive'));assert.equal(request.questions.useful_depth.criteria.length,5);
  const response=responseFor(request);assert.equal(validateEvaluation(response,request).model,'jev-1.13.0');
  const bad=structuredClone(response);bad.answers.opening_clarity.confidence=1.2;assert.throws(()=>validateEvaluation(bad,request));
  delete bad.answers.opening_clarity;assert.throws(()=>validateEvaluation(bad,request));
});

test('low confidence goes to review; linking suggestions require low competing-intent probability',()=>{
  const candidates=[{url:SITE+'/saints/therese-of-lisieux'}],request=makeRequest(extractPage(fixture,SITE+'/blog/prayer'),candidates);
  const response=responseFor(request);response.answers.opening_clarity={type:'score',score:1,confidence:0.4};
  let findings=editorialFindings(response,candidates);assert(findings.some(f=>f.priority==='review'&&f.confidence===0.4));assert(!findings.some(f=>f.priority==='medium'));assert(findings.some(f=>f.kind==='internal-link'));
  response.answers.overlap_0.noul=0.95;findings=editorialFindings(response,candidates);assert(!findings.some(f=>f.kind==='internal-link'));assert(findings.some(f=>f.kind==='overlap'&&f.priority==='review'));
});

test('key is sent only to the fixed TypeSafe API and is absent from state and error messages',async()=>{
  const key='test-key-not-a-real-credential',request=makeRequest(extractPage(fixture,SITE+'/blog/prayer'),[]);
  assert(!JSON.stringify(request).includes(key));
  let seen;
  await assert.rejects(typeSafeRequest('/v1/systemone',{apiKey:key,body:request,fetchFn:async(url,options)=>{seen={url,options};return new Response('reflected secret: '+key,{status:401});}}),e=>e.message.includes('API key was rejected')&&!e.message.includes(key));
  assert.equal(seen.url,'https://api.typesafe.ai/v1/systemone');assert.equal(seen.options.headers.Authorization,'Bearer '+key);assert.equal(seen.options.redirect,'manual');
  await assert.rejects(typeSafeRequest('/untrusted',{apiKey:key}),/Unsupported/);
});

test('report distinguishes observations from judgments and preserves scope limitations',()=>{
  const page=extractPage(fixture,SITE+'/blog/prayer');page.evaluation=responseFor(makeRequest(page,[]));page.findings=[];
  const md=markdownReport({generatedAt:'2026-10-01',mode:'Jev + technical',model:'jev-latest',pages:[page],usage:{input_tokens:1000,output_tokens:30}});
  assert(md.includes('not verified facts'));assert(md.includes('No live Search Console'));assert(md.includes('90%'));assert(md.includes('No content was changed'));
});
