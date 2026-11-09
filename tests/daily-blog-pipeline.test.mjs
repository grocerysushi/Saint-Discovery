// Entire suite uses temporary files, fake HTTP responses and an in-memory PostgreSQL.
// Never invokes the InsForge CLI, the publishing wrapper, or a production transport.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import {clock,dateGuard,dailyId,makePost,makeSQL,validateInputs,prepare,validateReview,fileHashes,json,hash} from '../scripts/daily-blog-pipeline.mjs';
import {assertProject,checkLink,reconciled,rows} from '../scripts/daily-blog-runtime.mjs';
const NOW=new Date('2026-11-08T12:00:00Z');
const plan={date:'2026-11-08',timeZone:'America/Chicago',time:'05:00',authorId:'fixture-author',topicAliases:['fixture topic']};
const content={title:'Fixture article',slug:'fixture-article',excerpt:'Offline fixture.',author:'Fixture',category:'Everyday faith',cover:'https://www.metmuseum.org/art',coverAlt:'Fixture only',coverCredit:'Fixture attribution',ads:false,body:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Fixture one',marks:[{type:'link',attrs:{href:'https://www.vatican.va/'}}]},{type:'text',text:'Fixture two',marks:[{type:'link',attrs:{href:'https://www.usccb.org/'}}]}]}]}};
const research={sources:[{url:'https://www.vatican.va/',title:'Fixture one',claims:['Fixture claim'],authoritativeCatholic:true},{url:'https://www.usccb.org/',title:'Fixture two',claims:['Fixture claim']}],artwork:{sourceUrl:content.cover,rightsUrl:'https://creativecommons.org/publicdomain/zero/1.0/',status:'public-domain',artist:'Fixture',title:'Fixture',license:'Fixture',rightsEvidence:'Fixture only, not real rights',attribution:content.coverCredit,actualArtwork:true}};

test('Central DST, before five, midnight and stale dates fail closed',()=>{
 assert.deepEqual(clock(new Date('2026-07-01T10:00:00Z')),{date:'2026-07-01',hour:5});
 assert.deepEqual(clock(new Date('2026-11-08T11:00:00Z')),{date:'2026-11-08',hour:5});
 assert.throws(()=>dateGuard(plan.date,new Date('2026-11-08T10:59:59Z')),/05:00/);
 assert.throws(()=>dateGuard(plan.date,new Date('2026-11-09T06:00:00Z')),/today/);
 assert.doesNotThrow(()=>dateGuard(plan.date,NOW));
 assert.equal(dailyId(plan.date),dailyId(plan.date)); assert.notEqual(dailyId(plan.date),dailyId('2026-11-09'));
});
test('review prerequisites, sources, conflicts, ads and inline images',()=>{
 assert.doesNotThrow(()=>validateInputs(plan,content,research,[]));
 assert.throws(()=>validateInputs(plan,{...content,ads:true},research,[]));
 assert.throws(()=>validateInputs(plan,content,{...research,sources:[]},[]));
 assert.throws(()=>validateInputs(plan,content,research,[{id:'other',slug:content.slug,title:'Different'}]));
 assert.throws(()=>validateInputs(plan,content,research,[{id:'other',slug:'other',title:'Fixture TOPIC'}]));
 const image=structuredClone(content); image.body.content.push({type:'image',attrs:{src:content.cover,alt:'test'}});
 assert.throws(()=>validateInputs(plan,image,research,[]),/Inline/);
 assert.throws(()=>makePost(plan,{...content,title:''}),/validation/);
});
test('HTTP checks reject failures, unapproved redirects, and unknown hosts',async()=>{
 assert.equal((await checkLink('https://www.vatican.va/',async()=>new Response('ok',{status:200}))).status,200);
 await assert.rejects(checkLink('https://www.vatican.va/',async()=>new Response('bad',{status:404})),/404/);
 await assert.rejects(checkLink('https://www.vatican.va/',async()=>new Response(null,{status:302,headers:{location:'https://127.0.0.1/'}})),/Private/);
 await assert.rejects(checkLink('https://unreviewed.example/',async()=>{throw Error('must not fetch')}),/allowlist/);
});
test('project identity and reconciliation fail closed',()=>{
 const context={authenticated:true,project:{project_id:'e1018255-7faf-4675-b407-80cd00a62bca',appkey:'f6zwvi29',oss_host:'https://f6zwvi29.us-east.insforge.app'}};
 assert.doesNotThrow(()=>assertProject(context)); assert.throws(()=>assertProject({...context,authenticated:false}));
 assert.throws(()=>assertProject({...context,project:{...context.project,appkey:'other'}}));
 assert.deepEqual(rows({rows:[]}),[]); assert.throws(()=>rows({}));
 assert.equal(reconciled([],plan),false);
 assert.equal(reconciled([{day:plan.date,trashed:false,stages:2,matches:true}],plan),true);
 assert.throws(()=>reconciled([{day:plan.date,trashed:false,stages:2,matches:false}],plan));
});
test('preparation hashes all inputs and independent review rejects tampering',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'daily-blog-fixture-'));
 try {
  await fs.mkdir(path.join(dir,'images'));
  const original=Buffer.from('OFFLINE TEST ARTWORK ONLY');
  await fs.writeFile(path.join(dir,'original.fixture'),original);
  const metadata={cover:content.cover,coverAlt:content.coverAlt,coverCredit:content.coverCredit};
  for (const [file,value] of Object.entries({'plan.json':plan,'content.json':content,'research.json':research,'catalog.json':[],'metadata.json':metadata,'images/metadata.optimized.json':metadata,'images/image-optimization.json':{sourceUrl:metadata.cover,sourceCredit:metadata.coverCredit,sourceAlt:metadata.coverAlt,sourceMetadataHash:hash(json(metadata)),reviewedInput:path.join(dir,'original.fixture'),originalSha256:hash(original)}})) await fs.writeFile(path.join(dir,file),json(value));
  const post=await prepare(dir); assert.deepEqual(post.draft,post.published);
  const review={status:'approved',reviewerId:'independent-fixture-reviewer',reviewedAt:NOW.toISOString(),hashes:await fileHashes(dir),notes:'Offline fixture only',checks:Object.fromEntries(['catholicAccuracy','citationsSupportClaims','topicDistinct','artworkRights','artworkVisual','altAndCredit','adFree','noInlineImages'].map(x=>[x,true]))};
  await fs.writeFile(path.join(dir,'editorial-review.json'),json(review));
  await validateReview(dir,NOW);
  await fs.writeFile(path.join(dir,'editorial-review.json'),json({...review,reviewerId:plan.authorId}));
  await assert.rejects(validateReview(dir,NOW),/Separate/);
  await fs.writeFile(path.join(dir,'editorial-review.json'),json(review));
  await fs.appendFile(path.join(dir,'content.json'),' ');
  await assert.rejects(validateReview(dir,NOW),/changed/);
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});

async function databaseFixture() {
 const db=new PGlite();
 await db.exec(`CREATE TABLE blog_posts(id uuid PRIMARY KEY,revision integer NOT NULL DEFAULT 0,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),published_at timestamptz,trashed boolean DEFAULT false);
 CREATE TABLE blog_post_content(post_id uuid REFERENCES blog_posts(id),stage text CHECK(stage IN ('draft','published')),title text,slug text,excerpt text,author text,category text,cover text,"coverAlt" text,"coverCredit" text,body jsonb,ads boolean,PRIMARY KEY(post_id,stage));
 CREATE UNIQUE INDEX publication_slug ON blog_post_content(slug) WHERE stage='published';`);
 return db;
}
const fixedSQL=(p=plan,c=content)=>makeSQL(p,makePost(p,c)).replaceAll('clock_timestamp()',"'2026-11-08T12:00:00Z'::timestamptz");
test('real PostgreSQL SQL is atomic, ad-free and idempotent after unknown outcome',async()=>{
 const db=await databaseFixture();try{
  await db.exec(fixedSQL()); await db.exec(fixedSQL());
  assert.equal((await db.query('SELECT count(*)::int AS n FROM blog_posts')).rows[0].n,1);
  const stages=(await db.query('SELECT stage,ads FROM blog_post_content ORDER BY stage')).rows;
  assert.deepEqual(stages,[{stage:'draft',ads:false},{stage:'published',ads:false}]);
  await assert.rejects(db.exec(fixedSQL(plan,{...content,title:'Changed'})),/differs/); await db.exec('ROLLBACK');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM blog_posts')).rows[0].n,1);
 }finally{await db.close();}
});
test('PostgreSQL blocks stale day, another daily post, slug and topic conflicts',async()=>{
 const db=await databaseFixture();try{
  await assert.rejects(db.exec(fixedSQL({...plan,date:'2026-11-07'})),/window/);await db.exec('ROLLBACK');
  await db.exec(`INSERT INTO blog_posts(id,published_at) VALUES ('00000000-0000-0000-0000-000000000001','2026-11-08T11:00:00Z')`);
  await assert.rejects(db.exec(fixedSQL()),/already exists/);await db.exec('ROLLBACK');
  await db.exec('DELETE FROM blog_posts');
  await db.exec(`INSERT INTO blog_posts(id) VALUES ('00000000-0000-0000-0000-000000000001'); INSERT INTO blog_post_content(post_id,stage,title,slug) VALUES ('00000000-0000-0000-0000-000000000001','draft','Other title','fixture-article')`);
  await assert.rejects(db.exec(fixedSQL()),/conflict/);await db.exec('ROLLBACK');
  await db.exec("UPDATE blog_post_content SET slug='other',title='Fixture topic'");
  await assert.rejects(db.exec(fixedSQL()),/conflict/);await db.exec('ROLLBACK');
 }finally{await db.close();}
});
test('failure in content insert rolls back parent and both stages',async()=>{
 const db=await databaseFixture();try{
  await db.exec("ALTER TABLE blog_post_content ADD CONSTRAINT fixture_failure CHECK (stage <> 'published')");
  await assert.rejects(db.exec(fixedSQL()),/fixture_failure/);await db.exec('ROLLBACK');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM blog_posts')).rows[0].n,0);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM blog_post_content')).rows[0].n,0);
 }finally{await db.close();}
});

test('publisher generates a single implicit transaction with immediate bounded locks',()=>{
 const sql=makeSQL(plan,makePost(plan,content));
 assert(sql.startsWith('DO $daily$')); assert(sql.endsWith('END $daily$;\n'));
 assert.match(sql,/SHARE ROW EXCLUSIVE MODE NOWAIT/);
 assert.doesNotMatch(sql,/SET LOCAL|COMMIT;|^BEGIN;/);
 assert.equal([...sql.matchAll(/decode\('[A-Za-z0-9+/=]+'\s*,\s*'base64'\)/g)].length,1);
});

test('direct runtime entry retains the mandatory cover gate before any database call',async()=>{
 const source=await fs.readFile(new URL('../scripts/daily-blog-runtime.mjs',import.meta.url),'utf8');
 const body=source.slice(source.indexOf('export async function runPublication'));
 assert(body.indexOf('await checkBlogCover(')>0);
 assert(body.indexOf('await checkBlogCover(')<body.indexOf("assertProject(cli(['current']))"));
 assert(body.includes('const sql=makeSQL(plan,post)'));
});
