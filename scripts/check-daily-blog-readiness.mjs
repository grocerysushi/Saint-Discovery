// Strictly read-only deployment preflight. No upload, publication, login or credential access.
import assert from 'node:assert/strict';
import {assertProject,cli,database} from './daily-blog-runtime.mjs';
import {clock} from './daily-blog-pipeline.mjs';
assertProject(cli(['current']));
const columns=database("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('blog_posts','blog_post_content')");
for (const [table,names] of Object.entries({blog_posts:['id','revision','created_at','updated_at','published_at','trashed'],blog_post_content:['post_id','stage','title','slug','excerpt','author','category','cover','coverAlt','coverCredit','body','ads']})) {
 for (const name of names) assert(columns.some(c=>c.table_name===table && c.column_name===name),`Missing schema field ${table}.${name}`);
}
const indexes=database("SELECT indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='blog_post_content'");
assert(indexes.some(i=>/CREATE UNIQUE INDEX/.test(i.indexdef) && /\(slug\)/.test(i.indexdef) && /published/.test(i.indexdef)),'Published slug uniqueness is required');
const counts=database('SELECT count(*)::int AS total, count(*) FILTER (WHERE published_at IS NOT NULL AND NOT trashed)::int AS published FROM public.blog_posts');
const buckets=cli(['storage','buckets']);
assert(Array.isArray(buckets) && buckets.some(b=>b.name==='blog-images' && b.public===true),'Approved public artwork bucket unavailable');
console.log(JSON.stringify({status:'read-only-preflight-passed',project:'Saint Discovery Quiz',central:clock(),counts:counts[0],bucket:'blog-images',note:'Does not certify an article, editorial review, publishing authorization, SQL execution permissions, or live rendering.'},null,2));
