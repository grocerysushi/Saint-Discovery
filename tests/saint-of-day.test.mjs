import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
const fixtures = [{ slug: 'first', name: 'First', feast_day: 'January 1' }, { slug: 'second', name: 'Second', feast_day: 'January 1' }];

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
  const { getSaintOfDay } = loadDaily();
  for (const date of ['02-30', '13-01', '00-00', 'bad', '05-31', '10-03']) assert.equal(getSaintOfDay(date), null);
  assert.equal(getSaintOfDay('02-29').date, '02-29');
});

test('every feast day in the current calendar has historical or generated artwork', () => {
  const { getSaintOfDay } = loadDaily();
  const saints = JSON.parse(fs.readFileSync(path.join(root, 'lib/data/saints.json'), 'utf8'));
  const dates = new Set(saints.map(s => s.feast_day).filter(Boolean));
  for (const feast of dates) {
    const date = new Date(`${feast}, 2024`);
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const saint = getSaintOfDay(key);
    assert.equal(saint.feastDay, feast);
    assert.ok(saint.image, `Missing artwork for ${feast}: ${saint.name}`);
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
