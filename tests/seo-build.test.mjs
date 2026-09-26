import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';

const read = file => fs.readFileSync(new URL(`../${file.replace(/^\.next\//, `${process.env.SAINT_BUILD_DIR || '.next'}/`)}`, import.meta.url), 'utf8');
const saints = await loadTs('lib/saints.ts').getAllSaints();
const { reviews } = loadTs('lib/saint-reviews.ts');
const { getSaintContribution } = loadTs('lib/saint-contributions.ts');
const origin = 'https://www.saintdiscoveryquiz.com';
const html = route => read(`.next/server/app/${route}.html`);
const decode = value => value.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (source, key) => decode(source.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1] ?? '');
const jsonLd = source => [...source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

test('life guides have indexable content, citations, sitemap entries, and reciprocal biography links', () => {
  const { PATRON_GUIDES } = loadTs('lib/patron-guides.ts');
  const sitemap = read('.next/server/app/sitemap.xml.body');
  const index = html('patron-saint-of');
  for (const guide of PATRON_GUIDES) {
    const route = `/patron-saint-of/${guide.slug}`;
    const source = html(route.slice(1));
    const rendered = decode(source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
    assert.equal((source.match(/<h1\b/g) ?? []).length, 1, guide.slug);
    assert.ok(source.includes(`rel="canonical" href="${origin}${route}"`), guide.slug);
    assert.equal(meta(source, 'description'), guide.description, guide.slug);
    assert.ok(!/noindex/.test(meta(source, 'robots')), guide.slug);
    assert.equal(sitemap.split(`<loc>${origin}${route}</loc>`).length - 1, 1, guide.slug);
    assert.ok(index.includes(`href="${route}"`), guide.slug);
    assert.ok(rendered.includes(guide.distinction), guide.slug);
    const article = jsonLd(source).flatMap(item => item['@graph'] ?? [item]).find(item => item['@type'] === 'Article');
    assert.equal(article?.dateModified, guide.reviewedOn, guide.slug);
    for (const entry of guide.saints) {
      assert.ok(rendered.includes(entry.explanation), `${guide.slug}: explanation`);
      assert.ok(source.includes(`href="/saints/${entry.slug}"`), `${guide.slug}: biography link`);
      assert.ok(html(`saints/${entry.slug}`).includes(`href="${route}"`), `${guide.slug}: reverse link`);
      for (const citation of entry.sources) {
        assert.ok(source.includes(`href="${citation.url.replace(/&/g, '&amp;')}"`), citation.url);
        assert.ok(article.citation.includes(citation.url), citation.url);
      }
    }
  }
});

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
    const renderedContent = decode(source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
    for (const paragraph of reviews[saint.slug].biography) {
      assert.ok(renderedContent.includes(paragraph), `${saint.slug}: missing server-rendered biography paragraph`);
    }
    const contribution = getSaintContribution(saint.slug);
    assert.equal(article.dateModified, contribution?.reviewed_on ?? reviews[saint.slug].reviewed_on, saint.slug);
    if (contribution) {
      const rendered = decode(source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ''));
      assert.ok(rendered.includes(contribution.title), `${saint.slug}: contribution heading`);
      for (const paragraph of contribution.paragraphs) assert.ok(rendered.includes(paragraph), `${saint.slug}: contribution body`);
      assert.ok(rendered.includes(contribution.reflection), `${saint.slug}: original reflection`);
      for (const citation of contribution.sources) {
        assert.ok(source.includes(`href="${citation.url.replace(/&/g, '&amp;')}"`), `${saint.slug}: source link`);
        assert.ok(article.citation.includes(citation.url), `${saint.slug}: structured citation`);
      }
      const sitemap = read('.next/server/app/sitemap.xml.body');
      assert.ok(sitemap.includes(`<loc>${canonical}</loc>\n<lastmod>${contribution.reviewed_on}T00:00:00.000Z</lastmod>`), `${saint.slug}: sitemap content date`);
    }
    assert.deepEqual(article.citation, [...new Set([...reviews[saint.slug].sources, ...(contribution?.sources ?? [])].map(entry => entry.url))], saint.slug);
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
