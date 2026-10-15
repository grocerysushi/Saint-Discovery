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

test('editorial connections and aliases reference canonical saints with unique safe article slugs', async () => {
  const { blogSaintConnections, blogSaintAliases } = loadTs('lib/blog-saint-connections.ts');
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  for (const slug of new Set([...Object.keys(blogSaintConnections), ...Object.keys(blogSaintAliases)])) {
    assert.ok(saints.some(s => s.slug === slug && s.kind !== 'unresolved' && s.kind !== 'observance'), slug);
  }
  for (const articles of Object.values(blogSaintConnections)) {
    assert.equal(new Set(articles).size, articles.length);
    for (const slug of articles) assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
  for (const aliases of Object.values(blogSaintAliases)) for (const alias of aliases) assert.ok(alias.includes(' '), alias);
});

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

test('editorial connections outrank all themes, name matches and recency in a stable reading order', () => {
  const francis = { slug: 'francis-of-assisi', name: 'Francis of Assisi', description: 'Prayer, Scripture, Gospel, mercy, mission, Eucharist and pilgrimage.' };
  const catalog = [
    article('latest-themes', 'Prayer Scripture mercy mission Eucharist pilgrimage rosary suffering', '', { publishedAt: '2026-09-22' }),
    article('new-francis', 'Francis of Assisi and Prayer', '', { publishedAt: '2026-09-22' }),
    article('what-is-transitus-st-francis-october-3', 'What Is the Transitus of St. Francis? An October 3 Guide'),
    article('can-lay-people-become-franciscans-secular-order', 'Can Lay People Become Franciscans? The Secular Order Explained'),
    article('canticle-of-the-creatures-st-francis-prayer', 'The Canticle of the Creatures: St. Francis’s Song of Praise Explained', '', { publishedAt: '2026-08-01' }),
  ];
  const expected = ['canticle-of-the-creatures-st-francis-prayer', 'can-lay-people-become-franciscans-secular-order'];
  assert.deepEqual(Array.from(recommendBlogPosts(francis, catalog, now), p => p.slug), expected);
  assert.deepEqual(Array.from(recommendBlogPosts(francis, [...catalog].reverse(), now), p => p.slug), expected);
  assert.equal(recommendBlogPosts(francis, catalog.filter(p => !expected.includes(p.slug)), now)[0].slug, 'what-is-transitus-st-francis-october-3');
});

test('Faustina, Thérèse and both Ignatius saints receive their own associated reading', () => {
  const catalog = [
    article('how-to-read-saint-faustina-diary', 'How to Read Saint Faustina’s Diary'),
    article('what-is-divine-mercy-chaplet-sunday', 'What Is Divine Mercy?'),
    article('saint-therese-little-way-daily-life', 'Saint Thérèse’s Little Way in Daily Life'),
    article('why-st-therese-patron-saint-missions', 'Why Is St. Thérèse the Patron Saint of Missions?'),
    article('how-to-pray-daily-examen-five-steps', 'How to Pray the Daily Examen in Five Steps'),
    article('saint-ignatius-antioch-eucharist-letters-guide', 'Saint Ignatius of Antioch: His Letters and the Eucharist'),
  ];
  for (const [slug, name, expected] of [
    ['faustina-kowalska', 'Faustina Kowalska', ['how-to-read-saint-faustina-diary', 'what-is-divine-mercy-chaplet-sunday']],
    ['therese-of-lisieux', 'Thérèse of Lisieux', ['saint-therese-little-way-daily-life', 'why-st-therese-patron-saint-missions']],
    ['ignatius-of-loyola', 'Ignatius of Loyola', ['how-to-pray-daily-examen-five-steps']],
    ['ignatius-of-antioch', 'Ignatius of Antioch', ['saint-ignatius-antioch-eucharist-letters-guide']],
  ]) assert.deepEqual(Array.from(recommendBlogPosts({ slug, name, description: '' }, catalog, now), p => p.slug), expected);
});

test('shared first names and incidental mentions do not become direct saint connections', () => {
  const catalog = [
    article('canticle-of-the-creatures-st-francis-prayer', 'St. Francis’s Song', 'Compare this with Francis de Sales.'),
    article('daily-prayer-routine-busy-catholics', 'A Daily Prayer Routine', 'Saint Francis de Sales offers help.'),
    article('pope-francis', 'Pope Francis on hope'),
    article('why-saint-john-xxiii-feast-day-october-11', 'Saint John XXIII’s Feast'),
    article('joseph-cupertino', 'Saint Joseph of Cupertino'),
    article('teresa-andes', 'Saint Teresa of Jesus of the Andes'),
  ];
  assert.equal(recommendBlogPosts({ slug: 'francis-de-sales', name: 'Francis de Sales', description: '' }, catalog, now)[0].slug, 'daily-prayer-routine-busy-catholics');
  for (const [slug, name] of [['john', 'John'], ['joseph', 'Joseph'], ['teresa-of-avila', 'Teresa of Avila']]) {
    assert.equal(recommendBlogPosts({ slug, name, description: '' }, catalog, now).length, 0);
  }
  assert.deepEqual(Array.from(recommendBlogPosts({ slug: 'francis-of-assisi', name: 'Francis of Assisi', description: '' }, catalog, now), p => p.slug), ['canticle-of-the-creatures-st-francis-prayer']);
});

test('qualified editorial aliases normalize accents without accepting bare abbreviated names', () => {
  const saint = { slug: 'therese-of-lisieux', name: 'Thérèse of Lisieux', description: '' };
  const result = recommendBlogPosts(saint, [article('therese-alias', 'Lessons from Thérèse Lisieux'), article('another-teresa', 'Teresa on prayer'), article('bare-therese', 'Thérèse on prayer')], now);
  assert.deepEqual(Array.from(result, p => p.slug), ['therese-alias']);
});

test('editorial links remain subject to publication and input guards; absent links are not invented', () => {
  const saint = { slug: 'francis-of-assisi', name: 'Francis of Assisi', description: '' };
  const result = recommendBlogPosts(saint, [
    article('canticle-of-the-creatures-st-francis-prayer', 'The Canticle', '', { publishedAt: '2030-01-01' }),
    article('can-lay-people-become-franciscans-secular-order', ''),
    article('what-is-transitus-st-francis-october-3', 'The Transitus'),
    article('what-is-transitus-st-francis-october-3', 'Duplicate'),
  ], now);
  assert.deepEqual(Array.from(result, p => p.slug), ['what-is-transitus-st-francis-october-3']);
  assert.deepEqual(Array.from(recommendBlogPosts(saint, [], now)), []);
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

function componentHarness(fetcher, initialPosts = []) {
  const effects = [], events = [], state = [];
  let cursor = 0, intersection, disconnected = 0;
  const jsx = (type, props) => ({ type, props });
  const component = load('components/BlogRecommendations.tsx', {
    react: { useRef: value => ({ current: value ?? {} }), useState: initial => { const i = cursor++; state[i] ??= initial; return [state[i], value => { state[i] = value; }]; }, useEffect: fn => effects.push(fn) },
    'react/jsx-runtime': { jsx, jsxs: jsx }, 'next/link': 'Link', '@/lib/analytics': { track: (name, params) => events.push({ name, params }) },
  }, { fetch: fetcher, window: { setTimeout: () => 1, clearTimeout() {} }, IntersectionObserver: class {
    constructor(fn) { intersection = fn; } observe() {} disconnect() { disconnected++; }
  } });
  return { render: () => { cursor = 0; return component.default({ saintSlug: saint.slug, placement: 'result_blog', initialPosts }); },
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
  assert.equal(ui.events[0].name, 'article_recommendation_view');
  assert.deepEqual(JSON.parse(JSON.stringify(ui.events[0].params)), {
    article_slug: 'padre-pio-confession-lessons', saint_slug: 'padre-pio', link_placement: 'result_blog', recommendation_position: 1, recommendation_version: 'v1',
  });
  assert.equal(ui.events[1].name, 'article_recommendation_click');
  assert.deepEqual(ui.events[1].params, ui.events[0].params);
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

test('biography article links are present before effects run and survive a refresh outage', async () => {
  const initialPosts = recommendBlogPosts(saint, posts, now);
  const ui = componentHarness(async () => { throw Error('offline'); }, initialPosts);
  assert.equal(nodes(ui.render()).filter(n => typeof n.type === 'function').length, 2);
  ui.effects.shift()(); await flush();
  assert.equal(nodes(ui.render()).filter(n => typeof n.type === 'function').length, 2);
  let fail = false;
  const jsx = (type, props) => ({ type, props });
  const server = load('components/BiographyArticles.tsx', {
    'react/jsx-runtime': { jsx }, './BlogRecommendations': 'Cards',
    '@/lib/blog-recommendations': { recommendBlogPosts },
    '@/lib/blog-recommendations-server': { getReadingCatalog: async () => { if (fail) throw Error('offline'); return posts; } },
  });
  assert.equal((await server.default({ saint })).props.initialPosts.length, 2);
  fail = true;
  assert.equal((await server.default({ saint })).props.initialPosts.length, 0);
  assert.equal(await server.default({ saint: { ...saint, kind: 'observance' } }), null);
});
