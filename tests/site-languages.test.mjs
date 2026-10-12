import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const { SITE_LANGUAGES, publicTranslationUrl, translatedPageUrl, proxyNavigationUrl, isTranslationProxy } = loadTs('lib/site-languages.ts');

test('translation retains the public page but strips all potentially private URL data', () => {
  const url = new URL(translatedPageUrl('/saints/joseph?token=secret&email=private%40example.com#private', 'es'));
  assert.equal(url.origin, 'https://translate.google.com');
  assert.equal(url.searchParams.get('sl'), 'en');
  assert.equal(url.searchParams.get('tl'), 'es');
  assert.equal(url.searchParams.get('u'), 'https://www.saintdiscoveryquiz.com/saints/joseph');
  assert.doesNotMatch(url.href, /secret|private|token|email/);
  assert.equal(translatedPageUrl('/resources?gender=Female', 'en'), 'https://www.saintdiscoveryquiz.com/resources');
});

test('account, email actions, APIs, downloads, other origins and encoded paths are not translatable', () => {
  for (const path of ['/admin', '/admin/blog', '/confirm?token=secret', '/unsubscribe', '/unsubscribed', '/subscribed', '/api/blog/posts', '/%61dmin/blog', '//evil.example/quiz', 'https://evil.example/blog', 'javascript:alert(1)', '/blog/feed.xml', '/saints/joseph/opengraph-image', '/blog/../confirm']) {
    assert.equal(publicTranslationUrl(path), null, path);
    assert.equal(translatedPageUrl(path, 'es'), null, path);
    assert.equal(proxyNavigationUrl(path, 'es'), null, path);
  }
  assert.equal(translatedPageUrl('/quiz', 'unsupported'), null);
});

test('translated navigation keeps the selected language on a safe fixed proxy host', () => {
  const url = new URL(proxyNavigationUrl('https://www-saintdiscoveryquiz-com.translate.goog/blog/why-catholics-use-holy-water?token=secret', 'fr'));
  assert.equal(url.hostname, 'www-saintdiscoveryquiz-com.translate.goog');
  assert.equal(url.pathname, '/blog/why-catholics-use-holy-water');
  assert.equal(url.searchParams.get('_x_tr_tl'), 'fr');
  assert.equal(url.searchParams.get('_x_tr_sl'), 'en');
  assert.doesNotMatch(url.href, /secret|token/);
  assert.equal(isTranslationProxy('www-saintdiscoveryquiz-com.translate.goog.evil.example'), false);
});

test('all offered languages are unique, valid destinations and include both Chinese scripts', () => {
  assert.equal(new Set(SITE_LANGUAGES.map(item => item.code)).size, SITE_LANGUAGES.length);
  for (const language of SITE_LANGUAGES) assert.ok(translatedPageUrl('/quiz', language.code));
  assert.ok(SITE_LANGUAGES.some(item => item.code === 'zh-CN'));
  assert.ok(SITE_LANGUAGES.some(item => item.code === 'zh-TW'));
  assert.deepEqual(Array.from(SITE_LANGUAGES.slice(0, 3), item => item.code), ['es', 'de', 'fr']);
});

test('translated searches preserve only recognized public filters', () => {
  const directory = new URL(proxyNavigationUrl('/resources?q=Th%C3%A9r%C3%A8se&gender=Female&month=October&token=secret&email=private&redirect=evil#private', 'es'));
  assert.equal(directory.searchParams.get('q'), 'Thérèse');
  assert.equal(directory.searchParams.get('gender'), 'Female');
  assert.equal(directory.searchParams.get('month'), 'October');
  assert.equal(directory.searchParams.get('_x_tr_tl'), 'es');
  assert.doesNotMatch(directory.href, /secret|private|redirect/);
  const blog = new URL(proxyNavigationUrl('/blog?q=prayer&category=Everyday%20faith&page=2&unknown=discard', 'de'));
  assert.equal(blog.searchParams.get('category'), 'Everyday faith');
  assert.equal(blog.searchParams.get('page'), '2');
  assert.equal(blog.searchParams.has('unknown'), false);
  assert.equal(new URL(proxyNavigationUrl('/quiz?q=private', 'es')).searchParams.has('q'), false);
});

test('proxy clicks and GET forms use document navigation while private actions return to English', () => {
  const listeners = new Map();
  const assigned = [];
  const storage = new Map();
  class Anchor {
    constructor(path, target = '') { this.href = new URL(path, 'https://www-saintdiscoveryquiz-com.translate.goog').href; this.target = target; this.dataset = {}; }
    closest() { return this; }
    getAttribute() { return this.href; }
    hasAttribute() { return false; }
  }
  class Form {
    method = 'get';
    action = 'https://www-saintdiscoveryquiz-com.translate.goog/blog';
    values = [['q', 'prayer'], ['category', 'Everyday faith']];
  }
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(new URL('../components/LanguageSwitcher.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports: loaded.exports, module: loaded, URL, URLSearchParams, HTMLAnchorElement: Anchor, HTMLFormElement: Form,
    FormData: class { constructor(form) { this.values = form.values; } [Symbol.iterator]() { return this.values[Symbol.iterator](); } },
    document: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: () => {} },
    window: { location: { hostname: 'www-saintdiscoveryquiz-com.translate.goog', origin: 'https://www-saintdiscoveryquiz-com.translate.goog', href: 'https://www-saintdiscoveryquiz-com.translate.goog/?_x_tr_tl=es', search: '?_x_tr_tl=es', assign: url => assigned.push(url) }, sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } },
    require(name) {
      if (name === 'react') return { useState: () => [false, () => {}], useEffect: fn => fn(), useId: () => 'languages', useRef: () => ({ current: null }), useSyncExternalStore: (_, snapshot) => snapshot() };
      if (name === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
      if (name === '@/lib/analytics') return { track: () => {} };
      if (name === '@/lib/use-translation-proxy') return { useTranslationProxy: () => true };
      if (name === '@/lib/site-languages') return loadTs('lib/site-languages.ts');
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  loaded.exports.default({ pathname: '/', onOpen: () => {} });
  assert.equal(storage.get('sd:translation-language'), 'es');
  const event = target => ({ target, button: 0, preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } });
  const normal = event(new Anchor('/saints/joseph'));
  listeners.get('click')(normal);
  assert.equal(normal.prevented, true);
  assert.equal(normal.stopped, true);
  assert.equal(new URL(assigned.at(-1)).searchParams.get('_x_tr_tl'), 'es');
  const modified = { ...event(new Anchor('/resources')), ctrlKey: true };
  listeners.get('click')(modified);
  assert.equal(modified.prevented, undefined);
  assert.equal(new URL(modified.target.href).searchParams.get('_x_tr_tl'), 'es');
  const external = event(new Anchor('https://www.vatican.va/'));
  listeners.get('click')(external);
  assert.equal(external.stopped, undefined);
  listeners.get('click')(event(new Anchor('/confirm?token=signed')));
  assert.equal(assigned.at(-1), 'https://www.saintdiscoveryquiz.com/confirm?token=signed');
  const formEvent = event(new Form());
  listeners.get('submit')(formEvent);
  const search = new URL(assigned.at(-1));
  assert.equal(formEvent.prevented, true);
  assert.equal(search.searchParams.get('q'), 'prayer');
  assert.equal(search.searchParams.get('_x_tr_tl'), 'es');
  const post = new Form(); post.method = 'post';
  const postEvent = event(post);
  listeners.get('submit')(postEvent);
  assert.equal(postEvent.prevented, undefined);
});
