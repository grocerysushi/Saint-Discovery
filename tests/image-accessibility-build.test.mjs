import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parse } from 'parse5';
import { loadTs } from './load-ts.mjs';

test('all built biography images expose the reviewed alternative in server HTML', async () => {
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  const { getSaintArtwork } = loadTs('lib/saint-artwork.ts');
  for (const saint of saints) {
    const html = fs.readFileSync(new URL(`../${process.env.SAINT_BUILD_DIR || '.next'}/server/app/saints/${saint.slug}.html`, import.meta.url), 'utf8');
    const images = [];
    function walk(node) {
      if (node.tagName === 'img') images.push(Object.fromEntries(node.attrs.map(a => [a.name, a.value])));
      for (const child of node.childNodes ?? []) walk(child);
    }
    walk(parse(html));
    assert.ok(images.length, `${saint.slug}: server-rendered artwork`);
    for (const img of images) assert.ok(Object.hasOwn(img, 'alt'), `${saint.slug}: missing alt attribute`);
    assert.ok(images.some(img => img.alt === getSaintArtwork(saint).alt), `${saint.slug}: reviewed description rendered`);
  }
});
