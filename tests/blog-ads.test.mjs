import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { loadTs } from './load-ts.mjs';

const { BLOG_ADS_BOOTSTRAP, ADSENSE_CLIENT } = loadTs('lib/blog-ads.ts');
function browser(href = 'https://www.saintdiscoveryquiz.com/blog') {
  const initial = new URL(href), scripts = [], events = {}, navigations = [], historyCalls = [];
  const location = { href, assign: url => navigations.push(['assign', url]), replace: url => navigations.push(['replace', url]), reload: () => navigations.push(['reload']) };
  const window = { addEventListener: (name, fn) => { events[name] = fn; } };
  const document = { getElementById: id => scripts.find(s => s.id === id), createElement: () => ({}), head: { appendChild: script => scripts.push(script) }, addEventListener: (name, fn) => { events[name] = fn; } };
  const history = Object.fromEntries(['pushState', 'replaceState'].map(method => [method, (...args) => historyCalls.push([method, ...args])]));
  const run = () => vm.runInNewContext(BLOG_ADS_BOOTSTRAP, { URL, window, document, location, history });
  return { initial, location, scripts, events, navigations, historyCalls, history, run };
}
function click(href, overrides = {}) {
  const anchor = { href, target: '', hasAttribute: () => false };
  return { button: 0, target: { closest: () => anchor }, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...overrides };
}

test('Auto ads loads exactly once on production blog documents with the verified publisher', () => {
  for (const path of ['/blog', '/blog/', '/blog?page=2', '/blog?q=prayer', '/blog/is-saint-jude-same-as-judas-iscariot']) {
    const b = browser('https://www.saintdiscoveryquiz.com' + path); b.run(); b.run();
    assert.equal(b.scripts.length, 1);
    assert.equal(b.scripts[0].src, `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`);
    assert.equal(b.scripts[0].async, true); assert.equal(b.scripts[0].crossOrigin, 'anonymous');
  }
});
test('quiz, admin, preview, non-blog, feeds, local and deployment preview documents never load ads', () => {
  for (const url of ['https://www.saintdiscoveryquiz.com/', 'https://www.saintdiscoveryquiz.com/quiz', 'https://www.saintdiscoveryquiz.com/quiz/results/francis-of-assisi', 'https://www.saintdiscoveryquiz.com/admin/blog', 'https://www.saintdiscoveryquiz.com/blog?preview=1', 'https://www.saintdiscoveryquiz.com/blog/feed.xml', 'https://www.saintdiscoveryquiz.com/blog/sitemap.xml', 'https://www.saintdiscoveryquiz.com/blogging', 'http://www.saintdiscoveryquiz.com/blog', 'http://localhost:3118/blog', 'https://preview.vercel.app/blog']) {
    const b = browser(url); b.run(); assert.equal(b.scripts.length, 0, url); assert.equal(Object.keys(b.events).length, 0, url);
  }
});
test('blog navigation starts fresh documents; anchors and modified/new-tab links retain normal behavior', () => {
  const b = browser(); b.run();
  for (const path of ['/quiz', '/admin/blog', '/blog/next-article', '/blog?page=2']) {
    const e = click(b.initial.origin + path); b.events.click(e); assert.equal(e.prevented, true); assert.equal(e.stopped, true); assert.equal(b.navigations.at(-1)[1], b.initial.origin + path);
  }
  const before = b.navigations.length;
  for (const e of [click(b.location.href + '#reading-paths'), click('https://example.com/'), click(b.initial.origin + '/quiz', { ctrlKey: true }), click(b.initial.origin + '/quiz', { metaKey: true }), click(b.initial.origin + '/quiz', { button: 1 }), click(b.initial.origin + '/quiz', { defaultPrevented: true }), click(b.initial.origin + '/quiz', { target: { closest: () => ({ href: b.initial.origin + '/quiz', target: '_blank', hasAttribute: () => false }) } })]) {
    b.events.click(e); assert.equal(e.prevented, undefined);
  }
  assert.equal(b.navigations.length, before);
});
test('programmatic navigation and browser back cannot carry the ad runtime into non-blog pages', () => {
  const b = browser(); b.run();
  b.history.pushState({}, '', '/quiz'); assert.deepEqual(b.navigations.at(-1), ['assign', b.initial.origin + '/quiz']);
  b.history.replaceState({}, '', '/admin/blog'); assert.deepEqual(b.navigations.at(-1), ['replace', b.initial.origin + '/admin/blog']);
  b.history.replaceState({}, '', '#contents'); assert.equal(b.historyCalls.length, 1);
  b.location.href = b.initial.origin + '/quiz'; b.events.popstate(); assert.deepEqual(b.navigations.at(-1), ['reload']);
});
test('ad loading is scoped to public rendered blog content and respects the editor ad toggle', () => {
  const reader = fs.readFileSync(new URL('../components/blog/BlogReader.tsx', import.meta.url), 'utf8');
  assert.match(reader, /!preview && content\.ads && <BlogAdSense/);
  assert.match(reader, /posts\.length > 0 && <BlogAdSense/);
  const root = fs.readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(root, /BlogAdSense|BLOG_ADS_BOOTSTRAP/);
});
