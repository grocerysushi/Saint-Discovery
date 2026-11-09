// The only live publisher caller is publish-optimized-blog.mjs. No credentials are read here.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { validateReview, validateInputs, dateGuard, CATALOG_SQL, json, httpsUrl, bodyLinks, makeSQL } from './daily-blog-pipeline.mjs';
import {cli,assertProject} from './blog-project-guard.mjs';
import {checkBlogCover} from './check-blog-cover.mjs';
export {cli,assertProject};
export function rows(result) {
  const value = result.rows ?? result.data;
  assert(Array.isArray(value),'Unexpected CLI result; fail closed'); return value;
}
export function database(sql) { return rows(cli(['db','query',sql])); }
export async function snapshot(dir) {
  assertProject(cli(['current']));
  await fs.writeFile(path.join(dir,'catalog.json'),json(database(CATALOG_SQL)));
}
const HOSTS = ['saintdiscoveryquiz.com','www.saintdiscoveryquiz.com','www.vatican.va','vatican.va','www.usccb.org','usccb.org','bible.usccb.org','www.newadvent.org','newadvent.org','www.franciscanmedia.org','franciscanmedia.org','commons.wikimedia.org','upload.wikimedia.org','www.metmuseum.org','metmuseum.org','www.nga.gov','nga.gov','www.artic.edu','artic.edu','creativecommons.org','www.creativecommons.org'];
export async function checkLink(value, fetcher = fetch) {
  let url = httpsUrl(value);
  for (let n=0;n<6;n++) {
    assert(HOSTS.includes(new URL(url).hostname),'Link host not in reviewed source allowlist; extend only after review');
    const r = await fetcher(url,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'SaintDiscoveryEditorialLinkCheck/1.0'}});
    await r.body?.cancel();
    if ([301,302,303,307,308].includes(r.status)) { assert(r.headers.get('location'),'Missing redirect'); url=httpsUrl(new URL(r.headers.get('location'),url).href); continue; }
    assert.equal(r.status,200,`Link check failed: ${url} (${r.status})`);
    return {url:value,finalUrl:url,status:r.status,checkedAt:new Date().toISOString()};
  }
  throw new Error('Too many link redirects');
}
export async function checkLinks(post,research) {
  const urls=[...new Set([...bodyLinks(post.published.body),...research.sources.map(s=>s.url),research.artwork.sourceUrl,research.artwork.rightsUrl])];
  assert(urls.length <= 100,'Too many links');
  const result=[]; for (const url of urls) result.push(await checkLink(url)); return result;
}
export function reconcileSQL(post) {
  const item=Buffer.from(JSON.stringify(post.published)).toString('base64');
  return `SELECT p.id::text, p.trashed, (p.published_at AT TIME ZONE 'America/Chicago')::date::text AS day, count(c.*)::integer AS stages, bool_and((to_jsonb(c)-'post_id'-'stage')=convert_from(decode('${item}','base64'),'UTF8')::jsonb) AS matches FROM public.blog_posts p LEFT JOIN public.blog_post_content c ON c.post_id=p.id WHERE p.id='${post.id}' GROUP BY p.id;`;
}
export function reconciled(result,plan) {
  if (!result.length) return false;
  assert.equal(result.length,1); const row=result[0];
  assert.equal(row.day,plan.date); assert.equal(row.trashed,false); assert.equal(row.stages,2); assert.equal(row.matches,true,'Existing daily post differs; manual reconciliation required');
  return true;
}
export async function runPublication(dir) {
  // Independent hash, time and source review after the mandatory wrapper's cover gate.
  const {plan,post,research,catalog}=await validateReview(dir);
  // Defense in depth: importing this function cannot bypass the mandatory artwork gate.
  await checkBlogCover(path.join(dir,'post.json'),path.join(dir,'images/image-optimization.json'),path.join(dir,'images/metadata.optimized.json'));
  const coverReviewed=await validateReview(dir);
  assert.deepEqual(coverReviewed.plan,plan); assert.deepEqual(coverReviewed.post,post);
  const lock=path.join(dir,'.publishing-lock');
  await fs.mkdir(lock); // A crashed process leaves the lock intentionally. Never blindly remove it.
  try {
    assertProject(cli(['current']));
    if (reconciled(database(reconcileSQL(post)),plan)) {
      await fs.writeFile(path.join(dir,'publication-result.json'),json({status:'already-published',id:post.id,verifiedAt:new Date().toISOString()}));
      return {status:'already-published',id:post.id};
    }
    const links=await checkLinks(post,research);
    await fs.writeFile(path.join(dir,'link-checks.json'),json(links));
    // Last network check immediately before SQL. Catalog changes invalidate semantic topic review.
    const latest=database(CATALOG_SQL);
    assert.deepEqual(latest,catalog,'Catalog changed after editorial review; recheck topics and review again');
    validateInputs(plan,post.published,research,latest); dateGuard(plan.date);
    const rechecked=await validateReview(dir); // Detect local edits during slow network checks.
    assert.deepEqual(rechecked.plan,plan); assert.deepEqual(rechecked.post,post);
    // Execute the deterministic in-memory statement, never a file that could change after validation.
    const sql=makeSQL(plan,post);
    await fs.writeFile(path.join(dir,'publication-result.json'),json({status:'outcome-unknown-until-reconciled',id:post.id,attemptedAt:new Date().toISOString()}));
    // The transaction locks both tables, rechecks date/day/slug/topic and inserts both stages atomically.
    cli(['db','query',sql]);
    assert(reconciled(database(reconcileSQL(post)),plan),'Publication not found; do not retry blindly');
    const result={status:'published-live-verification-required',id:post.id,url:`https://saintdiscoveryquiz.com/blog/${post.published.slug}`,verifiedAt:new Date().toISOString()};
    await fs.writeFile(path.join(dir,'publication-result.json'),json(result)); return result;
  } finally { await fs.rmdir(lock); }
}
