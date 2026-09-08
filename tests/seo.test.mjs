import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, env = {}) {
  const mod = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, process: { env }, URL });
  return mod.exports;
}

test('preview deployment variables cannot change public canonical URLs', () => {
  const seo = load('lib/seo.ts', { VERCEL_URL: 'preview-123.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'project.vercel.app' });
  assert.equal(seo.absoluteUrl('/saints/joseph'), 'https://www.saintdiscoveryquiz.com/saints/joseph');
  const configured = load('lib/seo.ts', { NEXT_PUBLIC_SITE_URL: 'www.saintdiscoveryquiz.com/' });
  assert.equal(configured.absoluteUrl('/resources'), 'https://www.saintdiscoveryquiz.com/resources');
});

test('structured content cannot terminate its HTML script element', () => {
  const { serializeJsonLd } = load('lib/seo.ts');
  const value = { text: '</script><script>alert(1)</script> & prayer' };
  const encoded = serializeJsonLd(value);
  assert.ok(!encoded.includes('<'));
  assert.deepEqual(JSON.parse(encoded), value);
});

test('search snippets name their subject and only promise available sections', () => {
  const { saintSearchSummary, saintDisplayName } = load('lib/saint-seo.ts');
  const short = saintSearchSummary({ name: 'Joseph', slug: 'joseph', description: 'A life of faith.' });
  assert.equal(short.title, 'St. Joseph: Biography');
  assert.match(short.description, /^Discover St\. Joseph\./);
  const full = saintSearchSummary({ name: 'Joseph', slug: 'joseph', feast_day: 'March 19', prayer: 'Pray for us.', description: 'A life of faith. '.repeat(40) });
  assert.match(full.title, /Feast Day, Prayer/);
  assert.ok(full.description.length <= 160);
  assert.equal(saintDisplayName({ name: 'All Saints', slug: 'all-saints' }), 'All Saints');
  assert.equal(saintDisplayName({ name: 'Our Lady of Lourdes', slug: 'our-lady-of-lourdes' }), 'Our Lady of Lourdes');
});
