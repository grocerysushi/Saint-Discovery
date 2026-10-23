import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import { createRequire } from 'node:module';
import { loadTs } from './load-ts.mjs';
const require = createRequire(import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('../lib/data/responsive-images.json', import.meta.url)));
const { preparedImage } = loadTs('lib/static-images.ts');

test('every saint and catalogued blog cover has uncropped, bounded static variants', async () => {
  const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  const articles = JSON.parse(fs.readFileSync(new URL('../lib/data/blog-artwork-catalog.json', import.meta.url)));
  for (const src of [...saints.map(s => getSaintArtwork(s).src), ...articles.map(p => p.cover)]) assert.ok(preparedImage(src), src);
  const seen = new Set();
  for (const item of Object.values(manifest)) {
    for (const [width, url] of item.variants) {
      assert.ok(width <= item.width && width <= 1280);
      if (seen.has(url)) continue;
      seen.add(url);
      const meta = await sharp(fs.readFileSync(new URL('../public' + url, import.meta.url))).metadata();
      assert.equal(meta.width, width, url);
      assert.equal(meta.format, 'webp', url);
      assert.ok(Math.abs(meta.height - item.height * width / item.width) <= 1, `No crop: ${url}`);
    }
  }
});

test('renderer supplies actual static widths, alt text and direct fallback without optimizer calls', () => {
  const mod = { exports: {} };
  let state = '', rerender;
  const jsx = (type, props) => ({ type, props });
  const source = fs.readFileSync(new URL('../components/StaticImage.tsx', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, {
    module: mod, exports: mod.exports, require: name => name === '@/lib/static-images' ? { preparedImage } : name === 'react' ? { useState: () => [state, next => { state = next; }] } : name === 'react/jsx-runtime' ? { jsx } : require(name),
  });
  const src = Object.keys(manifest)[0];
  let errors = 0;
  rerender = () => mod.exports.default({ src, alt: 'Reviewed artwork', fill: true, priority: true, sizes: '90vw', onError: () => errors++ });
  let image = rerender();
  assert.equal(image.props.alt, 'Reviewed artwork');
  assert.equal(image.props.loading, 'eager');
  assert.equal(image.props.style.width, '100%');
  assert.match(image.props.srcSet, /\/images\/responsive\/.* 384w/);
  assert.doesNotMatch(image.props.srcSet, /_next\/image/);
  image.props.onError({}); image = rerender();
  assert.equal(image.props.src, src);
  assert.equal(image.props.srcSet, undefined);
  assert.equal(errors, 0);
  image.props.onError({}); assert.equal(errors, 1);
  const external = mod.exports.default({ src: 'https://example.org/new-cover.jpg', alt: 'New cover' });
  assert.equal(external.props.src, 'https://example.org/new-cover.jpg');
  assert.equal(external.props.srcSet, undefined);
});
