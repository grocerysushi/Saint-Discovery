// Local preparation and deterministic guards. Importing this module never publishes.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
const hook = registerHooks({ resolve(specifier, context, next) {
  if (specifier === './blog' && context.parentURL?.endsWith('/lib/blog-validation.ts')) return next('./blog.ts', context);
  return next(specifier, context);
} });
const { validateBlogPost } = await import('../lib/blog-validation.ts');
hook.deregister();
export const ZONE = 'America/Chicago';
export const hash = value => createHash('sha256').update(value).digest('hex');
export const json = value => JSON.stringify(value, null, 2) + '\n';
export const readJSON = async file => JSON.parse(await fs.readFile(file, 'utf8'));
export const REVIEW_FILES = ['plan.json', 'content.json', 'metadata.json', 'research.json', 'catalog.json', 'post.json', 'publish.sql', 'images/metadata.optimized.json', 'images/image-optimization.json'];
export function clock(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', hourCycle:'h23' }).formatToParts(now).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}
export function dateGuard(date, now = new Date()) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid daily date');
  const local = clock(now);
  assert.equal(local.date, date, 'Only today in America/Chicago may publish; no automatic catch-up');
  assert(local.hour >= 5, 'Publication must wait until 05:00 America/Chicago');
}
export function dailyId(date) {
  const h = hash(`saint-discovery-daily:${date}`);
  return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;
}
export const normalize = text => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function bodyLinks(body) {
  const result = [];
  function walk(n) {
    assert.notEqual(n.type, 'image', 'Inline images require a separate reviewed validation gate');
    for (const m of n.marks ?? []) if (m.type === 'link') result.push(m.attrs?.href);
    for (const c of n.content ?? []) walk(c);
  }
  walk(body); return [...new Set(result)];
}
export function httpsUrl(value) {
  assert(typeof value === 'string' && value.trim(), 'A nonempty URL is required');
  const u = new URL(value, 'https://saintdiscoveryquiz.com');
  assert.equal(u.protocol, 'https:'); assert(!u.username && !u.password && !u.port, 'Credential-bearing or custom-port URL rejected');
  assert(!/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/.test(u.hostname) && !/^[\d.]+$/.test(u.hostname) && !u.hostname.includes(':'), 'Private/local URL rejected');
  return u.href;
}
export function validateInputs(plan, content, research, catalog) {
  assert.equal(plan.timeZone, ZONE); assert.equal(plan.time, '05:00');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(plan.date));
  assert(typeof plan.authorId === 'string' && plan.authorId.trim());
  assert(Array.isArray(plan.topicAliases) && plan.topicAliases.length > 0 && plan.topicAliases.every(x => typeof x === 'string' && normalize(x).length >= 4));
  assert.equal(content.ads, false, 'Ad-free content required');
  assert.deepEqual(Object.keys(content).sort(), ['title','slug','excerpt','author','category','cover','coverAlt','coverCredit','ads','body'].sort(), 'Unexpected content fields');
  assert(Array.isArray(catalog), 'Complete database catalog required');
  assert(research.sources?.length >= 2, 'At least two checked sources required');
  for (const source of research.sources) {
    httpsUrl(source.url); assert(source.title?.trim() && source.claims?.length && source.claims.every(x => typeof x === 'string' && x.trim()), 'Source title and supported claims required');
  }
  assert(research.sources.some(s => s.authoritativeCatholic === true), 'An authoritative Catholic source is required');
  const rights = research.artwork;
  assert(rights && ['public-domain', 'licensed'].includes(rights.status));
  httpsUrl(rights.sourceUrl); httpsUrl(rights.rightsUrl);
  assert(rights.artist?.trim() && rights.title?.trim() && rights.license?.trim() && rights.rightsEvidence?.trim() && rights.attribution?.trim());
  assert.equal(rights.actualArtwork, true, 'Use actual reviewed artwork, not a generated substitute');
  const links = bodyLinks(content.body).map(httpsUrl);
  for (const source of research.sources) assert(links.includes(httpsUrl(source.url)), 'Every cited source must be linked in the article');
  for (const row of catalog) {
    if (row.id === dailyId(plan.date)) continue;
    assert.notEqual(row.slug, content.slug, 'Slug already exists in database');
    assert(![content.title, ...plan.topicAliases].some(t => normalize(t) === normalize(row.title)), 'Topic/title conflict in database');
  }
}
export function makePost(plan, content) {
  const post = { id: dailyId(plan.date), revision: 0, updatedAt: `${plan.date}T12:00:00.000Z`, publishedAt: null, trashed: false, draft: content, published: structuredClone(content) };
  assert.equal(validateBlogPost(post), '', 'Existing blog validation rejected content');
  return post;
}
export const CATALOG_SQL = `SELECT p.id::text, c.stage, c.slug, c.title, p.published_at::text AS "publishedAt", p.trashed FROM public.blog_posts p JOIN public.blog_post_content c ON c.post_id=p.id ORDER BY p.id,c.stage;`;
export function makeSQL(plan, post) {
  assert.equal(post.id, dailyId(plan.date)); assert(/^\d{4}-\d{2}-\d{2}$/.test(plan.date));
  const payload = Buffer.from(JSON.stringify(post.published)).toString('base64');
  // Only validated dates, UUIDs and base64 enter SQL. One encoded publication payload preserves the wrapper's equality check.
  const aliases = Buffer.from(JSON.stringify([post.published.title, ...plan.topicAliases].map(normalize))).toString('hex');
  return `DO $daily$
DECLARE item jsonb := convert_from(decode('${payload}', 'base64'), 'UTF8')::jsonb;
  topics jsonb := convert_from(decode('${aliases}', 'hex'), 'UTF8')::jsonb;
  local_now timestamp;
BEGIN
  LOCK TABLE public.blog_posts, public.blog_post_content IN SHARE ROW EXCLUSIVE MODE NOWAIT;
  local_now := clock_timestamp() AT TIME ZONE 'America/Chicago';
  IF local_now::date <> DATE '${plan.date}' OR local_now::time < TIME '05:00' THEN RAISE EXCEPTION 'Outside daily Central window'; END IF;
  IF EXISTS (SELECT 1 FROM public.blog_posts WHERE id='${post.id}') THEN
    IF NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE id='${post.id}' AND NOT trashed AND (published_at AT TIME ZONE 'America/Chicago')::date=DATE '${plan.date}')
      OR (SELECT count(*) FROM public.blog_post_content WHERE post_id='${post.id}' AND (to_jsonb(blog_post_content)-'post_id'-'stage')=item) <> 2
    THEN RAISE EXCEPTION 'Existing daily ID differs; reconcile manually'; END IF;
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM public.blog_posts WHERE (published_at AT TIME ZONE 'America/Chicago')::date=DATE '${plan.date}') THEN RAISE EXCEPTION 'A post already exists for this Central day'; END IF;
  IF EXISTS (SELECT 1 FROM public.blog_post_content c WHERE c.slug=item->>'slug' OR topics ? trim(regexp_replace(lower(c.title), '[^a-z0-9]+', ' ', 'g'))) THEN RAISE EXCEPTION 'Slug or topic conflict'; END IF;
  INSERT INTO public.blog_posts(id,revision,published_at) VALUES ('${post.id}',1,clock_timestamp());
  INSERT INTO public.blog_post_content(post_id,stage,title,slug,excerpt,author,category,cover,"coverAlt","coverCredit",body,ads)
  SELECT '${post.id}'::uuid,s,item->>'title',item->>'slug',item->>'excerpt',item->>'author',item->>'category',item->>'cover',item->>'coverAlt',item->>'coverCredit',item->'body',false FROM unnest(ARRAY['draft','published']) s;
END $daily$;
`;
}
export async function fileHashes(dir) {
  return Object.fromEntries(await Promise.all(REVIEW_FILES.map(async name => [name, hash(await fs.readFile(path.join(dir, name)))])));
}
export async function prepare(dir) {
  const [plan, original, research, catalog, metadata] = await Promise.all(['plan.json','content.json','research.json','catalog.json','images/metadata.optimized.json'].map(f => readJSON(path.join(dir,f))));
  const content = {...original, cover: metadata.cover, coverAlt: metadata.coverAlt, coverCredit: metadata.coverCredit};
  validateInputs(plan, content, research, catalog);
  const post = makePost(plan,content);
  await fs.writeFile(path.join(dir,'post.json'), json(post));
  await fs.writeFile(path.join(dir,'publish.sql'), makeSQL(plan,post));
  const hashes = await fileHashes(dir);
  await fs.writeFile(path.join(dir,'review-hashes.json'), json(hashes));
  await fs.writeFile(path.join(dir,'editorial-review.template.json'), json({status:'needs-independent-review', reviewerId:'', reviewedAt:'', hashes, checks:Object.fromEntries(['catholicAccuracy','citationsSupportClaims','topicDistinct','artworkRights','artworkVisual','altAndCredit','adFree','noInlineImages'].map(k=>[k,false])), notes:''}));
  return post;
}
export async function validateReview(dir, now = new Date()) {
  const [plan, post, research, catalog, review] = await Promise.all(['plan.json','post.json','research.json','catalog.json','editorial-review.json'].map(f=>readJSON(path.join(dir,f))));
  dateGuard(plan.date,now); validateInputs(plan,post.published,research,catalog);
  assert.deepEqual(post.draft,post.published); assert.deepEqual(post,makePost(plan,post.published));
  assert.equal(await fs.readFile(path.join(dir,'publish.sql'),'utf8'),makeSQL(plan,post),'SQL differs from guarded generator');
  assert.equal(review.status,'approved'); assert(review.reviewerId?.trim() && review.reviewerId !== plan.authorId,'Separate editorial reviewer required');
  assert(new Date(review.reviewedAt) <= now && now - new Date(review.reviewedAt) < 24*3600000,'Review must be recent');
  assert.deepEqual(review.hashes, await fileHashes(dir),'Reviewed files changed; require independent re-review');
  for (const key of ['catholicAccuracy','citationsSupportClaims','topicDistinct','artworkRights','artworkVisual','altAndCredit','adFree','noInlineImages']) assert.equal(review.checks?.[key],true,`Editorial check missing: ${key}`);
  assert(review.notes?.trim(),'Substantive review notes required');
  const metadata = await readJSON(path.join(dir,'metadata.json'));
  const receipt = await readJSON(path.join(dir,'images/image-optimization.json'));
  assert.equal(hash(await fs.readFile(path.join(dir,'metadata.json'))),receipt.sourceMetadataHash);
  assert.equal(metadata.cover,research.artwork.sourceUrl);
  assert.equal(receipt.sourceUrl,metadata.cover);
  assert.equal(receipt.sourceCredit,metadata.coverCredit);
  assert.equal(receipt.sourceAlt,metadata.coverAlt);
  assert.equal(metadata.coverCredit,research.artwork.attribution);
  assert.equal(hash(await fs.readFile(receipt.reviewedInput)),receipt.originalSha256,'Reviewed original artwork changed');
  return {plan,post,research,catalog};
}
