import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { loadTs } from './load-ts.mjs';

// biographies.test.mjs checks that every duplicate slug redirects to its
// canonical saint. This covers the other direction: hand-written redirects
// must not lead to a 404 or hide a page that is published.
const { canonicalSaintSlug, isPublishedSaintSlug } = loadTs('lib/saint-reviews.ts');
const published = slug => isPublishedSaintSlug(slug) && canonicalSaintSlug(slug) === slug;

async function saintRedirects() {
  const compiled = ts.transpileModule(fs.readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(compiled, { module: loaded, exports: loaded.exports, process: { env: {} }, __dirname: '.' });
  // Array.from copies out of the vm realm so deepStrictEqual compares plain arrays.
  return Array.from(await loaded.exports.default.redirects(),
    ({ source, destination }) => [/^\/saints\/([^/:]+)$/.exec(source)?.[1], /^\/saints\/([^/:]+)$/.exec(destination)?.[1]])
    .filter(([from, to]) => from && to);
}

test('every saint redirect lands on a published saint page', async () => {
  const broken = (await saintRedirects()).filter(([, to]) => !published(to)).map(([from, to]) => `${from} -> ${to}`);
  assert.deepEqual(broken, [], 'Redirect destinations must be published saints, or old links end in a 404');
});

test('no saint redirect hides a published saint page', async () => {
  const shadowed = (await saintRedirects()).filter(([from]) => published(from)).map(([from]) => from);
  assert.deepEqual(shadowed, []);
});
