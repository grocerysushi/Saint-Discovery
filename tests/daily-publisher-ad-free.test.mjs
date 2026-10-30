import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const publisher = fileURLToPath(new URL('../scripts/publish-optimized-blog.mjs', import.meta.url));
for (const [name, draft, published, expected] of [
  ['legacy ads enabled', { ads: true }, { ads: true }, 'draft.ads'],
  ['published ads enabled', { ads: false }, { ads: true }, 'published.ads'],
  ['missing draft flag', {}, { ads: false }, 'draft.ads'],
  ['missing published flag', { ads: false }, {}, 'published.ads'],
  ['both disabled proceed to existing cover gate', { ads: false }, { ads: false }, null],
]) {
  test(name, async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'saint-ad-free-'));
    try {
      await fs.writeFile(path.join(dir, 'post.json'), JSON.stringify({ draft, published }));
      const result = spawnSync(process.execPath, [publisher, dir], { encoding: 'utf8' });
      assert.notEqual(result.status, 0);
      if (expected) {
        assert.ok(result.stderr.includes(`Ad-free publishing requires ${expected} to be exactly false`), result.stderr);
      } else {
        // No image receipt is provided: the existing gate must still block publication.
        assert.match(result.stderr, /ENOENT/);
        assert.match(result.stderr, /image-optimization\.json/);
        assert.doesNotMatch(result.stderr, /Ad-free publishing requires/);
      }
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
}
