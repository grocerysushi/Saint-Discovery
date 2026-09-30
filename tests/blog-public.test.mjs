import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createServerClient } from '@insforge/sdk/ssr';
import { startBlogBackend } from './helpers/blog-postgrest-fixture.mjs';

function loadPublicBlog(client) {
  const loaded = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(new URL('../lib/blog-public.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports: loaded.exports, module: loaded,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'react') return { cache: fn => fn };
      if (name === './blog-server') return { blogClient: async () => client };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return loaded.exports;
}

const rows = Array.from({ length: 25 }, (_, i) => ({
  id: `post-${String(i + 1).padStart(2, '0')}`, publishedAt: '2026-09-17T12:00:00Z',
  published: { title: `Prayer ${i + 1}`, excerpt: 'A reflection on faith.', category: i < 13 ? 'Everyday faith' : 'Meet the saints', slug: `prayer-${i + 1}` },
}));
const fixture = async t => {
  const backend = await startBlogBackend(rows);
  t.after(backend.close);
  const client = createServerClient({ baseUrl: backend.origin, anonKey: 'local-fixture-only' });
  return { ...backend, client, ...loadPublicBlog(client) };
};

test('blog pagination avoids unsatisfiable ranges and uses filtered totals', async t => {
  const { getPublishedBlogPage, client, state } = await fixture(t);
  // Verify this backend really rejects the request that broke production.
  const raw = await client.database.from('blog_published_posts').select('id', { count: 'exact' }).range(11976, 11987);
  assert.equal(raw.status, 416);
  assert.equal(raw.error.code, 'PGRST103');
  state.rangeFailures = 0;
  const first = await getPublishedBlogPage();
  assert.equal(first.posts.length, 12);
  assert.equal(first.total, 25);
  assert.equal(first.pages, 3);
  const last = await getPublishedBlogPage(3);
  assert.equal(last.posts[0].id, 'post-25');
  assert.equal(last.posts.length, 1);
  for (const [page, category, search, total, pages] of [
    [4, '', '', 25, 3], [999, '', '', 25, 3],
    [3, 'Everyday faith', '', 13, 2], [999, 'Everyday faith', '', 13, 2],
    [2, 'Meet the saints', 'Prayer 25', 1, 1], [999, '', 'no such story', 0, 1],
  ]) {
    const result = await getPublishedBlogPage(page, category, search);
    assert.equal(result.posts.length, 0);
    assert.equal(result.total, total);
    assert.equal(result.pages, pages);
    assert.ok(result.page > result.pages, 'Caller must be able to select the 404 response');
  }
  const empty = await getPublishedBlogPage(1, '', 'no such story');
  assert.equal(empty.total, 0);
  assert.equal(empty.pages, 1);
  assert.equal(state.rangeFailures, 0);
});

test('blog searches preserve literal percent, underscore, backslash, quotes and filter punctuation', async t => {
  const { getPublishedBlogPage } = await fixture(t);
  for (const search of ['%', '_', '\\', '"', ',', '(', ')']) {
    assert.equal((await getPublishedBlogPage(1, '', search)).total, 0, `Unexpected wildcard match for ${search}`);
  }
  assert.equal((await getPublishedBlogPage(1, '', 'PRAYER')).total, 25);
  assert.equal((await getPublishedBlogPage(1, '', 'reflection')).total, 25);

  const punctuation = ['100%', 'under_score', 'path\\folder', 'say "hello"', 'comma,(colon:).', '\\"%_'];
  const backend = await startBlogBackend(punctuation.map((text, i) => ({
    id: String(i), publishedAt: '2026-09-17T12:00:00Z',
    published: { title: i % 2 ? 'Plain title' : text, excerpt: i % 2 ? text : 'Plain excerpt', category: 'Everyday faith' },
  })));
  t.after(backend.close);
  const blog = loadPublicBlog(createServerClient({ baseUrl: backend.origin, anonKey: 'local-fixture-only' }));
  for (const [i, search] of punctuation.entries()) {
    const result = await blog.getPublishedBlogPage(1, '', search);
    assert.equal(result.total, 1, `Literal search failed for ${search}`);
    assert.equal(result.posts[0].id, String(i));
  }
});

test('blog pagination propagates real storage and authorization failures', async t => {
  const { getPublishedBlogPage, state } = await fixture(t);
  for (const status of [401, 403, 503]) {
    state.failure = { status, body: { code: 'BACKEND_FAILURE', message: 'Fixture failure' } };
    await assert.rejects(getPublishedBlogPage(1), /could not be loaded/);
    await assert.rejects(getPublishedBlogPage(999), /could not be loaded/);
  }
});
