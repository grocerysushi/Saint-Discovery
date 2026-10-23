import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTs } from './load-ts.mjs';
test('evergreen pages stay static between deploys and emit static image URLs', async () => {
  const build = process.env.SAINT_BUILD_DIR || '.next';
  const manifest = JSON.parse(fs.readFileSync(new URL(`../${build}/prerender-manifest.json`, import.meta.url)));
  const saints = await loadTs('lib/saints.ts').getAllSaints();
  for (const route of ['/', '/patron-saint-of', ...saints.map(s => `/saints/${s.slug}`)]) {
    assert.equal(manifest.routes[route]?.initialRevalidateSeconds, false, route);
  }
  const html = fs.readFileSync(new URL(`../${build}/server/app/saints/zelie-martin.html`, import.meta.url), 'utf8');
  assert.match(html, /srcSet="\/images\/responsive\//);
  assert.doesNotMatch(html, /\/_next\/image\?/);
  assert.match(html, /Sepia photograph of Zélie Martin/);
});
