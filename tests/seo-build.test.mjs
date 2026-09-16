import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const read = file => fs.readFileSync(new URL(`../${file.replace(/^\.next\//, `${process.env.SAINT_BUILD_DIR || '.next'}/`)}`, import.meta.url), 'utf8');
const saints = await loadTs('lib/saints.ts').getAllSaints();
const { reviews } = loadTs('lib/saint-reviews.ts');
const origin = 'https://www.saintdiscoveryquiz.com';
const html = route => read(`.next/server/app/${route}.html`);
const decode = value => value.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (source, key) => decode(source.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1] ?? '');
const jsonLd = source => [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

test('confirmation guide is discoverable and recommends only reviewed Catholic saints', () => {
  const source = html('confirmation-saint-guide');
  const { CONFIRMATION_PICKS } = loadTs('lib/confirmation-guide.ts');
  assert.equal((source.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(source.includes(`rel="canonical" href="${origin}/confirmation-saint-guide"`));
  assert.ok(read('.next/server/app/sitemap.xml.body').includes(`${origin}/confirmation-saint-guide`));
  assert.ok(html('resources').includes('href="/confirmation-saint-guide"'));
  for (const pick of CONFIRMATION_PICKS) {
    assert.equal(reviews[pick.slug]?.status, 'source-reviewed', pick.slug);
    assert.equal(reviews[pick.slug]?.kind, 'saint', pick.slug);
    assert.ok(source.includes(`href="/saints/${pick.slug}"`), pick.slug);
  }
  for (const id of ['choosing', 'explore-saints', 'my-shortlist', 'questions', 'guide-sources']) {
    assert.ok(source.includes(`id="${id}"`), id);
  }
});

test('every saint has a unique canonical, readable server-rendered content, and matching article/breadcrumb metadata', () => {
  const titles = new Set();
  for (const saint of saints) {
    const source = html(`saints/${saint.slug}`);
    const canonical = `${origin}/saints/${saint.slug}`;
    assert.equal(source.match(/<link rel="canonical" href="([^"]+)"/)?.[1], canonical, saint.slug);
    const title = decode(source.match(/<title>(.*?)<\/title>/)?.[1] ?? '');
    assert.ok(title.includes(saint.name), saint.slug);
    assert.ok(!titles.has(title), `Duplicate title: ${title}`);
    titles.add(title);
    assert.ok(meta(source, 'description').includes(saint.name), saint.slug);
    assert.ok(meta(source, 'description').length <= 160, saint.slug);
    assert.equal((source.match(/<h1\b/g) ?? []).length, 1, saint.slug);
    assert.ok(!/noindex/.test(meta(source, 'robots')), saint.slug);
    assert.ok(meta(source, 'og:image').startsWith(`${canonical}/opengraph-image`), saint.slug);
    assert.ok(meta(source, 'twitter:image').startsWith(`${canonical}/opengraph-image`), saint.slug);
    const data = jsonLd(source);
    const article = data.find(item => item['@type'] === 'Article');
    assert.equal(article?.url, canonical, saint.slug);
    assert.equal(article?.mainEntityOfPage?.['@id'], canonical, saint.slug);
    assert.ok(source.includes('id="sources"'), `${saint.slug}: missing sources`);
    assert.equal(article.dateModified, reviews[saint.slug].reviewed_on, saint.slug);
    assert.deepEqual(article.citation, Array.from(reviews[saint.slug].sources, entry => entry.url), saint.slug);
    for (const citation of article.citation) assert.ok(source.includes(`href="${citation.replace(/&/g, '&amp;')}"`), saint.slug);
    assert.ok(!data.some(item => item['@type'] === 'ProfilePage'), saint.slug);
    const crumbs = data.find(item => item['@type'] === 'BreadcrumbList');
    assert.equal(crumbs?.itemListElement.at(-1)?.item, canonical, saint.slug);
    for (const match of source.matchAll(/href="#(biography|prayer|questions)"/g)) {
      assert.ok(source.includes(`id="${match[1]}"`), `${saint.slug}: missing section target`);
    }
  }
});

test('duplicate routes redirect and unresolved identities stay out of search discovery', () => {
  const sitemap = read('.next/server/app/sitemap.xml.body');
  const directory = html('resources');
  for (const [slug, review] of Object.entries(reviews)) {
    if (review.status === 'duplicate') {
      const redirect = JSON.parse(read(`.next/server/app/saints/${slug}.meta`));
      assert.equal(redirect.status, 308, slug);
      assert.equal(redirect.headers.Location ?? redirect.headers.location, `/saints/${review.canonical_slug}`, slug);
    } else if (review.status === 'needs-identification') {
      const source = html(`saints/${slug}`);
      assert.match(meta(source, 'robots'), /noindex/, slug);
      assert.ok(source.includes('earlier biographical claims have been withdrawn'), slug);
    } else continue;
    assert.ok(!sitemap.includes(`<loc>${origin}/saints/${slug}</loc>`), slug);
    assert.ok(!directory.includes(`href="/saints/${slug}"`), slug);
  }
});

test('directory and sitemap expose every saint without executing client JavaScript', () => {
  const directory = html('resources');
  const sitemap = read('.next/server/app/sitemap.xml.body');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URLs');
  for (const saint of saints) {
    assert.ok(directory.includes(`href="/saints/${saint.slug}"`), saint.slug);
    assert.ok(urls.includes(`${origin}/saints/${saint.slug}`), saint.slug);
  }
  assert.ok(urls.every(url => url.startsWith(`${origin}/`)));
  assert.ok(!urls.includes(`${origin}/quiz`));
  const collection = jsonLd(directory).find(item => item['@type'] === 'CollectionPage');
  assert.equal(collection.mainEntity.itemListElement.length, saints.length);
  assert.equal(collection.mainEntity.numberOfItems, saints.length);
  const robots = read('.next/server/app/robots.txt.body');
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
});
