import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

// Reads a finished `npm run build`; runs in CI through `npm run test:build`.
const build = process.env.SAINT_BUILD_DIR || '.next';
const read = file => fs.readFileSync(new URL(`../${build}/${file}`, import.meta.url), 'utf8');
const html = route => read(`server/app/${route}.html`);
const origin = 'https://www.saintdiscoveryquiz.com';
const jsonLd = source => [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

const { FEAST_MONTHS, feastDayHref, parseFeastDay } = loadTs('lib/feast-days.ts');
const { getAllSaints } = loadTs('lib/saints.ts');
const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
const { saintShortSummary } = loadTs('lib/saint-seo.ts');
const saints = await getAllSaints();
const sitemap = read('server/app/sitemap.xml.body');
const decode = value => value.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

test('feast calendar pages are static, canonical, single-H1 and in the sitemap', () => {
  for (const route of ['feast-days', ...FEAST_MONTHS.map(month => `feast-days/${month.slug}`)]) {
    const source = html(route);
    assert.ok(source.includes(`rel="canonical" href="${origin}/${route}"`), route);
    assert.equal((source.match(/<h1\b/g) ?? []).length, 1, route);
    assert.doesNotMatch(source, /noindex/, route);
    assert.ok(sitemap.includes(`<loc>${origin}/${route}</loc>`), `${route} missing from sitemap`);
    assert.ok(jsonLd(source).some(item => item['@type'] === 'BreadcrumbList'), route);
  }
});

test('every saint with a feast day is listed under its date, and its page links there', () => {
  for (const saint of saints.filter(s => s.feast_day)) {
    const { month, day } = parseFeastDay(saint.feast_day);
    const page = html(`feast-days/${month.slug}`);
    assert.ok(page.includes(`id="${month.slug}-${day}"`), `${saint.slug}: missing date anchor`);
    assert.ok(page.includes(`href="/saints/${saint.slug}"`), `${saint.slug}: missing from ${month.name}`);
    assert.ok(html(`saints/${saint.slug}`).includes(`href="${feastDayHref(saint.feast_day)}"`), `${saint.slug}: feast day not linked`);
  }
});

test('the sitemap lists historical artwork only', () => {
  const entries = new Map([...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => [m[1].match(/<loc>([^<]+)<\/loc>/)[1], m[1]]));
  for (const saint of saints) {
    const entry = entries.get(`${origin}/saints/${saint.slug}`);
    assert.ok(entry, saint.slug);
    const artwork = getSaintArtwork(saint);
    const historical = !artwork.generated && !artwork.symbolic;
    assert.equal(entry.includes('<image:loc>'), historical, `${saint.slug}: image entry should be ${historical ? 'present' : 'absent'}`);
    if (historical) assert.ok(entry.includes(`<image:loc>${origin}${artwork.src}</image:loc>`), saint.slug);
  }
});

test('the quiz page has a real heading and explanatory content before JavaScript runs', () => {
  const source = html('quiz');
  assert.match(source, /<h1[^>]*>Catholic Saint Quiz<\/h1>/);
  assert.equal((source.match(/<h1\b/g) ?? []).length, 1);
  assert.match(source, /How the Catholic saint quiz works/);
  const quiz = jsonLd(source).find(item => item['@type'] === 'Quiz');
  assert.equal(quiz?.url, `${origin}/quiz`);
  assert.equal(jsonLd(html('index')).find(item => item['@type'] === 'Quiz')?.url, `${origin}/quiz`);
});

test('patron cards show each saint’s reviewed summary', () => {
  const source = decode(html('patron-saint-of/firefighters'));
  const { getTopicBySlug } = loadTs('lib/patronage.ts');
  for (const slug of getTopicBySlug('firefighters').saints) {
    const saint = saints.find(s => s.slug === slug);
    if (saint) assert.ok(source.includes(saintShortSummary(saint)), slug);
  }
});

test('saint articles describe a person', () => {
  const article = jsonLd(html('saints/therese-of-lisieux')).find(item => item['@type'] === 'Article');
  assert.equal(article.about['@type'], 'Person');
});
