import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { loadTs } from './load-ts.mjs';

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

test('sharing cards identify their own canonical page and retain an image', () => {
  const { socialMetadata } = load('lib/seo.ts');
  const card = socialMetadata('Editorial policy', 'How we research our content.', '/editorial-policy');
  assert.equal(card.openGraph.url, 'https://www.saintdiscoveryquiz.com/editorial-policy');
  assert.equal(card.openGraph.title, 'Editorial policy');
  assert.equal(card.twitter.description, 'How we research our content.');
  assert.equal(card.twitter.card, 'summary_large_image');
  assert.ok(card.openGraph.images[0].url.endsWith('/opengraph-image'));
});

test('search snippets name their subject and only promise available sections', () => {
  const { saintSearchSummary, saintDisplayName } = loadTs('lib/saint-seo.ts');
  const short = saintSearchSummary({ name: 'Joseph', slug: 'joseph', description: 'A life of faith.' });
  assert.equal(short.title, 'St. Joseph: Biography');
  assert.match(short.description, /^Discover St\. Joseph\./);
  const full = saintSearchSummary({ name: 'Joseph', slug: 'joseph', feast_day: 'March 19', prayer: 'Pray for us.', description: 'A life of faith. '.repeat(40) });
  assert.match(full.title, /Feast Day, Prayer/);
  assert.ok(full.description.length <= 160);
  assert.equal(saintDisplayName({ name: 'All Saints', slug: 'all-saints' }), 'All Saints');
  assert.equal(saintDisplayName({ name: 'Our Lady of Lourdes', slug: 'our-lady-of-lourdes' }), 'Our Lady of Lourdes');
});

test('query-led saint snippets are specific without changing unrelated biographies', async () => {
  const { getAllSaints } = loadTs('lib/saints.ts');
  const { saintSearchSummary } = loadTs('lib/saint-seo.ts');
  const { getSaintReaderGuide } = loadTs('lib/saint-reader-guides.ts');
  const { getBiographyUpdatedOn } = loadTs('lib/directory-editorial.ts');
  const saints = await getAllSaints();
  const targets = ['joachim', 'jadwiga-of-poland', 'gabriel-the-archangel', 'toribio-romo-gonz-lez', 'kizito'];
  for (const saint of saints) {
    const guide = getSaintReaderGuide(saint.slug);
    assert.equal(Boolean(guide), targets.includes(saint.slug), saint.slug);
    const summary = saintSearchSummary(saint);
    assert.ok(summary.description.length <= 160, `${saint.slug}: description length`);
    if (!guide) continue;
    assert.equal(summary.title, guide.title);
    assert.equal(summary.description, guide.description);
    assert.equal(getBiographyUpdatedOn(saint.slug), '2026-10-22');
    assert.ok(guide.questions.every(question => question.sources.length > 0));
    for (const link of guide.related.filter(link => link.href.startsWith('/saints/'))) {
      assert.ok(saints.some(candidate => link.href === `/saints/${candidate.slug}`), link.href);
    }
  }
  assert.match(getSaintReaderGuide('joachim').introduction, /tradition/);
  assert.match(getSaintReaderGuide('kizito').introduction, /about 14/);
  assert.match(getSaintReaderGuide('gabriel-the-archangel').introduction, /not a human/);
});
