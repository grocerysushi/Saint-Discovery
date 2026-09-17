import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { loadTs } from './load-ts.mjs';
const blog = loadTs('lib/blog.ts');
const { validateBlogPost } = loadTs('lib/blog-validation.ts');
const { sameOrigin } = loadTs('lib/request-origin.ts');
test('origin checks accept the actual local host and reject cross-site requests', () => {
  const request = (origin, host = '127.0.0.1:3105') => ({ url: 'http://localhost:3105/api/blog/auth', headers: { get: key => key === 'origin' ? origin : host } });
  assert.equal(sameOrigin(request('http://127.0.0.1:3105')), true);
  assert.equal(sameOrigin(request('http://localhost:3105', 'localhost:3105')), true);
  assert.equal(sameOrigin(request('https://malicious.example')), false);
  assert.equal(sameOrigin(request('https://127.0.0.1:3105')), false);
  assert.equal(sameOrigin(request(null)), false);
  assert.equal(sameOrigin(request('null')), false);
});

test('post validation permits drafts and rejects malformed or unsafe publication input', () => {
  const post = blog.newBlogPost('11111111-1111-4111-8111-111111111111', new Date().toISOString());
  assert.equal(validateBlogPost(post), '');
  assert.match(validateBlogPost({ ...post, revision: -1 }), /revision/);
  assert.match(validateBlogPost({ ...post, published: post.draft }), /title/);
  assert.match(validateBlogPost({ ...post, draft: { ...post.draft, body: { type: 'doc', content: [null] } } }), /invalid/);
  let node = { type: 'text', text: 'nested' };
  for (let i = 0; i < 40; i++) node = { type: 'paragraph', content: [node] };
  assert.match(validateBlogPost({ ...post, draft: { ...post.draft, body: { type: 'doc', content: [node] } } }), /invalid/);
});

function storeFixture() {
  const effects = [];
  const requests = [];
  const backups = new Map();
  const initial = blog.newBlogPost('11111111-1111-4111-8111-111111111111', new Date().toISOString());
  const compiled = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(new URL('../components/blog/blog-store.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, {
    module: compiled, exports: compiled.exports, Date, URL, Blob, setTimeout, clearTimeout,
    localStorage: { setItem: (key, value) => backups.set(key, value), removeItem: key => backups.delete(key) },
    require: name => name === 'react' ? { useEffect: fn => effects.push(fn), useSyncExternalStore: (_, get) => get() } : blog,
    fetch: async (_url, options) => {
      if (!options?.method) return { ok: true, json: async () => ({ posts: [initial] }) };
      return new Promise(resolve => requests.push({ body: JSON.parse(options.body), resolve }));
    },
  });
  return { store: compiled.exports, effects, requests, backups, initial };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
test('autosave coalesces edits, serializes requests and uses confirmed server revisions', async () => {
  const f = storeFixture();
  f.store.useBlogPosts(); f.effects.shift()(); await tick();
  const a = f.store.storePost({ ...f.initial, draft: { ...f.initial.draft, title: 'First' } });
  const b = f.store.storePost({ ...a, draft: { ...a.draft, title: 'Second' } });
  const done = f.store.flushPost(a.id);
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].body.revision, 0);
  assert.equal(f.requests[0].body.draft.title, 'Second');
  const c = f.store.storePost({ ...b, draft: { ...b.draft, title: 'Third' } });
  f.requests[0].resolve({ ok: true, json: async () => ({ post: { ...b, revision: 1 } }) });
  await tick();
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].body.revision, 1);
  assert.equal(f.requests[1].body.draft.title, 'Third');
  f.requests[1].resolve({ ok: true, json: async () => ({ post: { ...c, revision: 2 } }) });
  await done;
  assert.equal(f.store.useBlogPosts().saving, false);
  assert.equal(f.backups.size, 0);
});
test('a rejected save preserves recovery data and never reports saved', async () => {
  const f = storeFixture();
  f.store.useBlogPosts(); f.effects.shift()(); await tick();
  const post = f.store.storePost(f.initial);
  const done = f.store.flushPost(post.id);
  f.requests[0].resolve({ ok: false, status: 409, json: async () => ({ error: 'Changed elsewhere' }) });
  await assert.rejects(done, /Changed elsewhere/);
  assert.equal(f.store.useBlogPosts().saving, true);
  assert.equal(f.store.useBlogPosts().error, 'Changed elsewhere');
  assert.equal(f.backups.size, 1);
});
