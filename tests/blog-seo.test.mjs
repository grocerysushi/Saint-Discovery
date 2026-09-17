import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const seo = loadTs('lib/blog-seo.ts');
const { SAMPLE_POSTS } = loadTs('lib/blog.ts');
test('article metadata uses the publication, real author, and honest publication date', () => {
  const content = SAMPLE_POSTS[0].published;
  const schema = seo.blogArticleSchema(content, '2026-09-17T12:00:00Z');
  assert.equal(schema['@type'], 'BlogPosting');
  assert.equal(schema.author['@type'], 'Organization');
  assert.equal(schema.datePublished, '2026-09-17T12:00:00Z');
  assert.equal(schema.dateModified, undefined);
  assert.equal(schema.url, `https://www.saintdiscoveryquiz.com/blog/${content.slug}`);
  assert.equal(seo.blogArticleSchema({ ...content, author: 'Jane Doe' }, null).author['@type'], 'Person');
});
test('search descriptions and image metadata exclude unusable content', () => {
  assert.ok(seo.blogDescription({ excerpt: 'word '.repeat(100) }).length <= 160);
  assert.equal(seo.blogDescription({ excerpt: '', body: { type: 'doc', content: [{ type: 'text', text: 'Useful fallback.' }] } }), 'Useful fallback.');
  assert.equal(seo.blogImageUrl('data:image/png;base64,AAAA'), undefined);
  assert.equal(seo.blogImageUrl('javascript:alert(1)'), undefined);
  assert.equal(seo.blogImageUrl('/images/sacred-art.webp'), 'https://www.saintdiscoveryquiz.com/images/sacred-art.webp');
});
test('feed content is escaped and pagination preserves search filters', () => {
  assert.equal(seo.xmlEscape('A & B <tag> "quoted"'), 'A &amp; B &lt;tag&gt; &quot;quoted&quot;');
  const page = new URL(seo.blogBrowseUrl(2, 'Prayer & reflection', 'saint & prayer'), 'https://www.saintdiscoveryquiz.com');
  assert.equal(page.searchParams.get('page'), '2');
  assert.equal(page.searchParams.get('q'), 'saint & prayer');
  assert.equal(page.searchParams.get('category'), 'Prayer & reflection');
});
