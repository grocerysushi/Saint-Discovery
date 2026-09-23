import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const { recommendBlogPosts } = loadTs('lib/blog-recommendations.ts');
const saint = { slug: 'padre-pio', name: 'Padre Pio', description: 'A priest known for confession and prayer.' };
const article = (slug, title, excerpt = '', extra = {}) => ({ slug, title, excerpt, category: 'Everyday faith', publishedAt: '2026-09-01T12:00:00Z', ...extra });
const posts = [article('why-do-catholics-pray-to-saints', 'Why Do Catholics Pray to Saints?'), article('what-is-prayer', 'What Is Prayer?'), article('padre-pio-confession-lessons', 'Padre Pio and Confession'), article('unrelated', 'Walking the Camino')];
const now = Date.parse('2026-09-23T12:00:00Z');

test('saint-specific articles outrank thematic matches and unrelated latest posts', () => {
  const result = recommendBlogPosts(saint, posts, now);
  assert.deepEqual(Array.from(result, p => p.slug), ['padre-pio-confession-lessons', 'what-is-prayer']);
  assert.equal(result[0].reason, 'Connected to this saint');
  assert.equal(recommendBlogPosts({ ...saint, slug: 'faustina-kowalska', name: 'Faustina Kowalska' }, [article('what-is-divine-mercy-chaplet-sunday', 'What Is Divine Mercy?')], now)[0].reason, 'Connected to this saint');
});

test('fallbacks are useful saint guides; unavailable, future and malformed articles are excluded', () => {
  const neutral = { slug: 'joseph', name: 'Joseph', description: 'A carpenter.' };
  const catalog = [posts[0], posts[0], posts[3], article('how-to-celebrate-patron-saint-feast-day', 'Celebrate a feast day'),
    article('future-joseph', 'Joseph', '', { publishedAt: '2030-01-01' }), article('../admin', 'Joseph'), article('invalid-date', 'Joseph', '', { publishedAt: '' })];
  assert.deepEqual(Array.from(recommendBlogPosts(neutral, catalog, now), p => p.slug), ['why-do-catholics-pray-to-saints', 'how-to-celebrate-patron-saint-feast-day']);
  assert.equal(recommendBlogPosts(neutral, [], now).length, 0);
  assert.equal(recommendBlogPosts({ ...neutral, kind: 'unresolved' }, catalog, now).length, 0);
  assert.equal(recommendBlogPosts({ ...neutral, name: 'John', slug: 'john', description: '' }, [article('johnson', 'Johnson writes a book')], now).length, 0);
});

function load(file, deps, globals = {}) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, Date, URL, AbortController, require(name) { if (!(name in deps)) throw Error(name); return deps[name]; }, ...globals });
  return loaded.exports;
}

test('recommendation endpoint validates saints, returns public summaries and fails without breaking parent pages', async () => {
  let calls = 0, fail = false;
  const route = load('app/api/blog/recommendations/route.ts', {
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200, headers: options.headers }) } },
    '@/lib/saints': { getSaintBySlug: async slug => slug === saint.slug ? saint : null },
    '@/lib/blog-recommendations': { recommendBlogPosts },
    '@/lib/blog-recommendations-server': { getRecommendationCatalog: async () => { calls++; if (fail) throw Error('offline'); return posts; } },
  });
  const get = slug => route.GET({ nextUrl: new URL(`https://example.org/api/blog/recommendations?saint=${encodeURIComponent(slug)}`) });
  assert.equal((await get('../admin')).status, 400);
  assert.equal((await get('missing')).status, 404);
  assert.equal(calls, 0);
  const ok = await get(saint.slug);
  assert.equal(ok.status, 200); assert.equal(ok.body.posts.length, 2);
  assert.doesNotMatch(JSON.stringify(ok.body), /draft|body|ads|email/);
  fail = true;
  const offline = await get(saint.slug);
  assert.equal(offline.status, 503); assert.equal(offline.headers['Cache-Control'], 'no-store'); assert.equal(offline.body.posts.length, 0);
});

function componentHarness(fetcher) {
  const effects = [], events = [], state = [];
  let cursor = 0, intersection, disconnected = 0;
  const jsx = (type, props) => ({ type, props });
  const component = load('components/BlogRecommendations.tsx', {
    react: { useRef: value => ({ current: value ?? {} }), useState: initial => { const i = cursor++; state[i] ??= initial; return [state[i], value => { state[i] = value; }]; }, useEffect: fn => effects.push(fn) },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': 'Link', '@/lib/analytics': { track: (name, params) => events.push({ name, params }) },
  }, { fetch: fetcher, window: { setTimeout: () => 1, clearTimeout() {} }, IntersectionObserver: class {
    constructor(fn) { intersection = fn; } observe() {} disconnect() { disconnected++; }
  } });
  return { render: () => { cursor = 0; return component.default({ saintSlug: saint.slug, placement: 'result_blog' }); },
    effects, events, intersect: ratio => intersection([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]), disconnected: () => disconnected };
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

test('cards track visibility once and clicks separately with placement and no profile data', async () => {
  const ui = componentHarness(async () => ({ ok: true, json: async () => ({ posts: recommendBlogPosts(saint, posts, now) }) }));
  ui.render(); ui.effects.shift()(); await flush();
  const tree = ui.render();
  const card = nodes(tree).find(n => typeof n.type === 'function');
  const rendered = card.type(card.props);
  ui.effects.at(-1)();
  ui.intersect(.1); assert.equal(ui.events.length, 0);
  ui.intersect(.5); ui.intersect(1);
  assert.equal(ui.events.length, 1); assert.equal(ui.disconnected(), 1);
  rendered.props.onClick();
  assert.equal(ui.events[1].name, 'article_recommendation_click');
  assert.equal(ui.events[1].params.link_placement, 'result_blog');
  assert.equal(ui.events[1].params.article_slug, 'padre-pio-confession-lessons');
  assert.doesNotMatch(JSON.stringify(ui.events), /score|answer|email|token/);
});

test('outages leave a working blog link and unmounted requests cannot set state', async () => {
  const ui = componentHarness(async () => { throw Error('offline'); });
  ui.render(); ui.effects.shift()(); await flush();
  assert.ok(nodes(ui.render()).some(n => n.props?.href === '/blog'));
  assert.equal(nodes(ui.render()).filter(n => typeof n.type === 'function').length, 0);
  let resolve;
  const late = componentHarness(() => new Promise(done => { resolve = done; }));
  late.render(); const cleanup = late.effects.shift()(); cleanup();
  resolve({ ok: true, json: async () => ({ posts }) }); await flush();
  assert.equal(nodes(late.render()).filter(n => typeof n.type === 'function').length, 0);
});
