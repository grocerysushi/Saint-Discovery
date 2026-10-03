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
  if (Object.hasOwn(overrides, 'saints.json')) {
    overrides = { 'directory-additions.json': [], 'saint-calendar-commemorations.json': {},
      'saint-artwork-additions.json': {}, 'us-saint-calendar.json': {reviewedOn:'2026-10-03', sources:[], dates:{}},
      'saint-reviews-root.json': { ...JSON.parse(fs.readFileSync(path.join(root,'lib/data/saint-reviews-root.json'),'utf8')), ...Object.fromEntries(overrides['saints.json'].map(saint=>[saint.slug,{status:'source-reviewed',kind:saint.kind,name:saint.name,feast_day:saint.feast_day,biography:[saint.name],sources:[],quotes:[]}])) },
      ...overrides };
  }
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
  const { getDailyExperience } = loadTs('lib/daily-experience.ts', { 'saints.json': [], 'directory-additions.json': [], 'saint-calendar-commemorations.json': {} });
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

test('U.S. calendar saints take precedence even without a portrait', () => {
  const { getSaintOfDay } = loadDaily({ 'saints.json': fixtures,
    'saint-images.json': {first:{src:'/historic.webp'}}, 'saint-generated-images.json': {},
    'us-saint-calendar.json': {reviewedOn:'2026-10-03',sources:[],dates:{'01-01':[{slug:'second',rank:3}]}},
  });
  const daily=getSaintOfDay('01-01');
  assert.equal(daily.slug,'second');
  assert.equal(daily.image.symbolic,true);
  assert.match(daily.calendarNote,/USCCB/);
});

test('higher U.S. rank wins before artwork; non-U.S. companions remain discoverable', async () => {
  const {getSaintOfDay}=loadDaily({'saints.json':fixtures,
    'saint-images.json':{first:{src:'/historic.webp'}},'saint-generated-images.json':{},
    'us-saint-calendar.json':{reviewedOn:'2026-10-03',sources:[],dates:{'01-01':[{slug:'first',rank:2},{slug:'second',rank:3}]}},
  });
  assert.equal(getSaintOfDay('01-01').slug,'second');
  const real=loadDaily();
  assert.equal(real.getSaintOfDay('07-14').slug,'kateri-tekakwitha');
  assert.equal(real.getSaintOfDay('01-06').slug,'andr-bessette');
  const daily=await loadTs('lib/daily-experience.ts').getDailyExperience('10-09');
  const combined=[daily.featured.slug,...daily.alsoToday.map(s=>s.slug)];
  assert.ok(combined.includes('john-henry-newman'));
  assert.ok(combined.includes('john-leonardi'));
});

test('U.S. proper date differences preserve the original biography dates', async () => {
  const {getUSSaintPriority}=loadTs('lib/us-saint-calendar.ts');
  const {saintHasCalendarDate}=loadTs('lib/saint-calendar.ts');
  const {getSaintBySlug}=loadTs('lib/saints.ts');
  for(const [slug,usDate,otherDate] of [['vincent','01-23','01-22'],['camillus-de-lellis','07-18','07-14'],['paul-of-the-cross','10-20','10-19']]) {
    const saint=await getSaintBySlug(slug);
    assert.ok(saint,slug);
    assert.ok(getUSSaintPriority(slug,usDate)>0);
    assert.equal(getUSSaintPriority(slug,otherDate),0);
    assert.equal(saintHasCalendarDate(saint,usDate),true);
    assert.equal(saintHasCalendarDate(saint,otherDate),true);
  }
  assert.equal(getUSSaintPriority('marcellinus','06-02'),0,'Pope Marcellinus must not be confused with the martyr');
});

test('every published saint and every daily date has correctly disclosed artwork', async () => {
  const {getSaintArtwork}=loadTs('lib/saint-artwork.ts');
  const saints=await loadTs('lib/saints.ts').getAllSaints();
  const {getSaintOfDay}=loadDaily();
  for(const saint of saints) {
    const image=getSaintArtwork(saint);
    assert.ok(image.src && image.alt && image.credit && image.license && image.source,saint.slug);
    if(image.src.startsWith('/'))assert.ok(fs.statSync(path.join(root,'public',image.src)).size>100,saint.slug);
    if(image.symbolic)assert.match(image.alt,/not a portrait/i);
    if(image.generated)assert.match(image.alt,/AI-generated/i);
  }
  for(let day=0;day<366;day++) {
    const date=new Date(2024,0,day+1);
    const key=`${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    assert.ok(getSaintOfDay(key)?.image?.src,key);
  }
});

test('every civil date in ordinary and leap years has a published, sourced daily biography', async () => {
  const { getSaintOfDay } = loadDaily();
  const { getSaintBySlug } = loadTs('lib/saints.ts');
  const { getDailyExperience } = loadTs('lib/daily-experience.ts');
  const { saintHasCalendarDate } = loadTs('lib/saint-calendar.ts');
  for (const year of [2025, 2024]) {
    let checked = 0;
    for (let day = new Date(year, 0, 1); day.getFullYear() === year; day.setDate(day.getDate() + 1)) {
      const key = `${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      const featured = getSaintOfDay(key);
      assert.ok(featured, `${year}-${key}: missing daily saint`);
      const saint = await getSaintBySlug(featured.slug);
      assert.equal(saint?.kind, 'saint', key);
      assert.ok(saintHasCalendarDate(saint, key), key);
      const daily = await getDailyExperience(key);
      assert.equal(daily.featured.slug, featured.slug, key);
      assert.ok(daily.biography.length >= 2, `${key}: missing biography`);
      assert.ok(daily.sources.length > 0, `${key}: missing sources`);
      for (const companion of daily.alsoToday) {
        assert.ok(saintHasCalendarDate(await getSaintBySlug(companion.slug), key), `${key}: wrongly dated companion`);
      }
      checked++;
    }
    assert.equal(checked, year === 2024 ? 366 : 365);
  }
});

test('additional commemorations preserve identity, main feast and date-specific explanations', async () => {
  const { getDailyExperience } = loadTs('lib/daily-experience.ts');
  const { getSaintBySlug } = loadTs('lib/saints.ts');
  for (const [date, slug, primaryDate, explanation] of [
    ['01-25', 'paul-the-apostle', 'June 29', /Conversion/],
    ['05-01', 'joseph', 'March 19', /Worker/],
    ['04-17', 'kateri-tekakwitha', 'July 14', /Canada/],
  ]) {
    const daily = await getDailyExperience(date);
    assert.equal(daily.featured.slug, slug);
    assert.equal((await getSaintBySlug(slug)).feast_day, primaryDate);
    assert.match(daily.feastNote, explanation);
    assert.ok(daily.sources.some(source => /nominis\.cef\.fr|vaticannews\.va|cccb\.ca/.test(source.url)));
  }
  const leap = await getDailyExperience('02-29');
  assert.equal(leap.featured.slug, 'oswald-of-worcester');
  assert.match(leap.feastNote, /ordinary years.*leap years/);
  assert.equal((await getDailyExperience('10-02')).featured.slug, 'leodegar-of-autun');
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
