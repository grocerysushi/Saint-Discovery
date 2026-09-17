import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const blog = loadTs('lib/blog.ts');
const date = '2026-09-16T12:00:00.000Z';
function draft(id = 'test') {
  const post = blog.newBlogPost(id, date);
  post.draft.title = 'A new beginning'; post.draft.slug = 'a-new-beginning';
  post.draft.body = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Something worth sharing.' }] }] };
  return post;
}
test('publication snapshots preserve the reading version while edits remain drafts', () => {
  const post = draft();
  const published = blog.publishPost(post, [post], date);
  assert.equal(blog.postStatus(published), 'Published');
  published.draft.body.content[0].content[0].text = 'An unpublished revision.';
  assert.equal(published.published.body.content[0].content[0].text, 'Something worth sharing.');
  assert.equal(blog.postStatus(published), 'Unpublished changes');
  assert.equal(post.published, null);
});
test('publication rejects empty writing, conflicting slugs, and inaccessible cover images', () => {
  const empty = blog.newBlogPost('empty', date);
  assert.match(blog.publicationError(empty, []), /title/);
  const post = draft();
  const other = draft('other');
  assert.match(blog.publicationError(post, [post, other]), /already used/);
  post.draft.slug = 'Bad URL'; assert.match(blog.publicationError(post, []), /slug/);
  post.draft.slug = 'good-url'; post.draft.cover = 'https://example.org/photo.jpg';
  assert.match(blog.publicationError(post, []), /alt text/);
  post.draft.coverAlt = 'A quiet garden'; assert.equal(blog.publicationError(post, []), '');
  post.draft.body = { type: 'doc', content: [{ type: 'paragraph' }] }; assert.match(blog.publicationError(post, []), /content/);
});
test('blog links and images never allow executable or protocol-relative URLs', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,<script>x</script>', '//evil.test', '/\\evil.test']) {
    assert.equal(blog.safeBlogUrl(url), ''); assert.equal(blog.safeBlogUrl(url, true), '');
  }
  assert.equal(blog.safeBlogUrl('https://example.org/a'), 'https://example.org/a');
  assert.equal(blog.safeBlogUrl('/saints/dunstan'), '/saints/dunstan');
  assert.equal(blog.safeBlogUrl('mailto:hello@example.org'), 'mailto:hello@example.org');
  assert.equal(blog.safeBlogUrl('mailto:hello@example.org', true), '');
  assert.equal(blog.safeBlogUrl('data:image/svg+xml;base64,PHN2Zz4=', true), '');
});
test('sample posts are valid and word counts ignore images and attributes', () => {
  for (const post of blog.SAMPLE_POSTS) assert.equal(blog.publicationError(post, blog.SAMPLE_POSTS), '');
  assert.equal(blog.wordCount({ type: 'doc', content: [{ type: 'image', attrs: { src: 'https://example.org/image.png' } }] }), 0);
  assert.equal(blog.slugify('Thérèse & everyday faith!'), 'therese-everyday-faith');
  assert.equal(blog.postStatus({ ...draft(), trashed: true }), 'Trash');
});
