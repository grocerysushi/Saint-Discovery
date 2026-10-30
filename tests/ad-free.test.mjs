import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
function load(file) {
  const loaded = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { module: loaded, exports: loaded.exports, URL, URLSearchParams, structuredClone, process: { env: {} }, require(specifier) {
    if (specifier === 'next/link') return function TestLink(props) { const clean = {...props}; delete clean.prefetch; return React.createElement('a', clean); };
    if (specifier === '@/components/StaticImage') return function TestImage(props) { const clean = {...props}; delete clean.fill; return React.createElement('img', clean); };
    if (specifier.startsWith('@/')) return load(specifier.slice(2)+'.ts');
    if (specifier.startsWith('.')) return load(path.join(path.dirname(file), specifier)+'.ts');
    return require(specifier);
  }});
  return loaded.exports;
}
const { ArticleView, BlogIndex } = load('components/blog/BlogReader.tsx');
const content = { title:'A guide to prayer', slug:'prayer-guide', category:'Prayer & reflection', author:'Saint Discovery', excerpt:'Explore a daily habit.', cover:'', coverAlt:'', coverCredit:'', ads:true,
  body:{type:'doc',content:Array.from({length:7},(_,i)=>({type:'paragraph',content:[{type:'text',text:`Paragraph ${i} ${'Words for a long article. '.repeat(30)}`}]}))} };
test('legacy ads:true articles and listings render all content without ad slots or loaders', () => {
  for (const ads of [true,false]) {
    const article=renderToStaticMarkup(React.createElement(ArticleView,{content:{...content,ads}}));
    for(let i=0;i<7;i++) assert.equal(article.split(`Paragraph ${i}`).length-1,1);
    const index=renderToStaticMarkup(React.createElement(BlogIndex,{posts:[{id:'fixture',published:{...content,ads}}],page:1,pages:1,total:1,category:'',search:''}));
    for(const html of [article,index]) {
      assert.doesNotMatch(html,/adsbygoogle|googlesyndication|fundingchoices|Advertisement|blog-article-ad|advertisement/i);
      assert.match(html,/A guide to prayer/);
    }
  }
});
test('publisher authorization and advertising entry points are removed', () => {
  assert.equal(fs.existsSync(path.join(root,'public/ads.txt')),false);
  for(const file of ['components/blog/ArticleAd.tsx','components/blog/BlogAdSense.tsx','lib/blog-ads.ts']) assert.equal(fs.existsSync(path.join(root,file)),false);
  for(const file of ['app/layout.tsx','components/PrivacyChoices.tsx','components/blog/BlogReader.tsx','components/blog/BlogEditor.tsx']) assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),/google-adsense-account|googlefc|__tcfapi|<ArticleAd|<BlogAdSense|Show ad placements/);
});
