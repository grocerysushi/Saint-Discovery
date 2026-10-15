import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { loadTs } from './load-ts.mjs';

test('every published saint has assigned artwork with honest attribution and a valid local asset', async () => {
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
  const assets = new Set();
  for (const saint of saints) {
    const artwork = getSaintArtwork(saint);
    assert.ok(!artwork.symbolic, `Unassigned artwork: ${saint.slug}`);
    assert.ok(artwork.src.startsWith('/images/'), `Unbundled image: ${saint.slug}`);
    assert.ok(artwork.alt && artwork.credit && artwork.license && artwork.source, saint.slug);
    if (artwork.generated) {
      assert.match(artwork.alt, /AI-generated artistic interpretation/i, saint.slug);
      assert.equal(artwork.license, 'AI-generated illustration', saint.slug);
    } else if (/^CC BY/.test(artwork.license)) {
      assert.ok(artwork.source.startsWith('https://'), saint.slug);
    }
    assets.add(artwork.src);
  }
  for (const src of assets) {
    const path = new URL(`../public${src}`, import.meta.url);
    assert.ok(fs.existsSync(path), `Missing asset: ${src}`);
    const image = await sharp(fileURLToPath(path)).metadata();
    assert.ok(image.width > 0 && image.height > 0, src);
    assert.ok(image.width <= 1467 && image.height <= 1467, `Oversized asset: ${src}`);
  }
});

test('unknown artwork retains an honest error fallback', () => {
  const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
  const artwork = getSaintArtwork({ slug: 'unknown-artwork-test', name: 'Unknown saint' });
  assert.equal(artwork.symbolic, true);
  assert.match(artwork.alt, /not a portrait/);
});
