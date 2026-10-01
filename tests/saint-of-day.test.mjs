import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { loadTs } from './load-ts.mjs';
import { fileURLToPath } from 'node:url';
import { hasRemoteMatch } from 'next/dist/shared/lib/match-remote-pattern.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function imagePatterns() {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  vm.runInNewContext(compiled, { module: loaded, exports: loaded.exports, process: { env: {} }, __dirname: root });
  return loaded.exports.default.images.remotePatterns;
}

test('the image optimizer accepts remote artwork for every day in the calendar', () => {
  const patterns = imagePatterns();
  const { getSaintOfDay } = loadDaily();
  for (let i = 0; i < 366; i++) {
    const day = new Date(2024, 0, i + 1);
    const date = `${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const saint = getSaintOfDay(date);
    if (saint?.image?.src.startsWith('https://')) {
      assert.ok(hasRemoteMatch([], patterns, new URL(saint.image.src)), `${date}: ${saint.slug}`);
    }
  }
});

test('thumbnail permission stays limited to HTTPS Commons paths on the exact host', () => {
  const patterns = imagePatterns();
  for (const url of [
    'http://thumb.wikimedia.org/wikipedia/commons/thumb/example.jpg',
    'https://thumb.wikimedia.org:444/wikipedia/commons/thumb/example.jpg',
    'https://thumb.wikimedia.org/other/example.jpg',
    'https://thumb.wikimedia.org.example.com/wikipedia/commons/thumb/example.jpg',
  ]) assert.equal(hasRemoteMatch([], patterns, new URL(url)), false, url);
});

function loadDaily(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith('.json')) {
      const key = path.basename(file);
      return Object.hasOwn(overrides, key) ? overrides[key] : JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    const compiledModule = { exports: {} };
    cache.set(file, compiledModule.exports);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(output, {
      module: compiledModule, exports: compiledModule.exports, Date,
      require(specifier) {
        const target = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(file), specifier);
        return load(path.extname(target) ? target : target + '.ts');
      },
    }, { filename: file });
    return compiledModule.exports;
  }
  return load(path.join(root, 'lib/saint-of-day.ts'));
}

const portrait = slug => ({ src: `/images/generated-saints/${slug}.webp`, generated: true });
const fixtures = [{ slug: 'first', kind: 'saint', name: 'First', feast_day: 'January 1' }, { slug: 'second', kind: 'saint', name: 'Second', feast_day: 'January 1' }];

test('daily experience uses reviewed biographies and keeps feast companions on the selected date', async () => {
  const { getDailyExperience } = loadTs('lib/daily-experience.ts');
  const { getBiographyReview } = loadTs('lib/saint-reviews.ts');
  const daily = await getDailyExperience('10-04');
  assert.ok(daily.featured);
  assert.deepEqual(Array.from(daily.biography), Array.from(getBiographyReview(daily.featured.slug).biography));
  assert.ok(daily.sources.length > 0);
  for (const other of daily.alsoToday) {
    assert.notEqual(other.slug, daily.featured.slug);
    assert.equal(getBiographyReview(other.slug).feast_day, 'October 4');
    assert.notEqual(other.kind, 'unresolved');
  }
  assert.equal((await getDailyExperience('10-04')).reflection.action, daily.reflection.action);
});

test('daily experience provides reflection on uncovered dates without inventing a biography', async () => {
  const { getDailyExperience } = loadTs('lib/daily-experience.ts', { 'saints.json': [] });
  const daily = await getDailyExperience('02-29');
  assert.equal(daily.featured, null);
  assert.equal(daily.biography.length, 0);
  assert.equal(daily.sources.length, 0);
  assert.ok(daily.reflection.question && daily.reflection.prayer && daily.reflection.action);
  assert.equal(await getDailyExperience('02-30'), null);
  assert.equal(await getDailyExperience('13-01'), null);
  assert.equal(await getDailyExperience('invalid'), null);
});

test('uses a saved generated illustration when historical art is missing', () => {
  const { getSaintOfDay } = loadDaily({ 'saints.json': fixtures, 'saint-images.json': {}, 'saint-generated-images.json': { first: portrait('first') } });
  const saint = getSaintOfDay('01-01');
  assert.equal(saint.slug, 'first');
  assert.equal(saint.image.generated, true);
});

test('historical artwork wins across saints sharing a feast day', () => {
  const { getSaintOfDay } = loadDaily({ 'saints.json': fixtures, 'saint-images.json': { second: { src: '/historic.webp' } }, 'saint-generated-images.json': { first: portrait('first'), second: portrait('second') } });
  const saint = getSaintOfDay('01-01');
  assert.equal(saint.slug, 'second');
  assert.equal(saint.image.src, '/historic.webp');
  assert.equal(saint.image.generated, undefined);
});

test('does not invent feast days or accept invalid dates', () => {
  const { getSaintOfDay } = loadDaily({ 'saints.json': [
    ...fixtures, { slug: 'leap-day-fixture', kind: 'saint', name: 'Leap day fixture', feast_day: 'February 29' },
  ] });
  for (const date of ['02-30', '13-01', '00-00', 'bad', '05-31', '10-03']) assert.equal(getSaintOfDay(date), null);
  assert.equal(getSaintOfDay('02-29').date, '02-29');
});

test('every published feast day resolves to a Catholic saint, with optional artwork', async () => {
  const { getSaintOfDay } = loadDaily();
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  const dates = new Set(saints.map(s => s.feast_day).filter(Boolean));
  for (const feast of dates) {
    const date = new Date(`${feast}, 2024`);
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const saint = getSaintOfDay(key);
    assert.equal(saint.feastDay, feast);
    assert.equal(saint.kind, 'saint');
    if (saint.image) assert.ok(saint.image.src);
  }
});

test('generated entries point to bundled files and carry explicit disclosure', () => {
  const generated = JSON.parse(fs.readFileSync(path.join(root, 'lib/data/saint-generated-images.json'), 'utf8'));
  assert.ok(Object.keys(generated).length > 0);
  for (const [slug, image] of Object.entries(generated)) {
    assert.equal(image.generated, true, slug);
    assert.match(image.alt, /AI-generated/);
    assert.equal(image.src, `/images/generated-saints/${slug}.webp`);
    assert.ok(fs.statSync(path.join(root, 'public', image.src)).size > 512, slug);
  }
});
