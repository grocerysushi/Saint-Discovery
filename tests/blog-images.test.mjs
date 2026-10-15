import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';
const { canOptimizeBlogImage } = loadTs('lib/blog-images.ts');

test('blog optimization stays within the configured image origins', () => {
  for (const source of ['/images/art.webp', 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Art.jpg', 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Art.jpg/750px-Art.jpg']) {
    assert.equal(canOptimizeBlogImage(source), true, source);
  }
  for (const source of ['https://example.org/art.jpg', 'https://upload.wikimedia.org.evil.test/wikipedia/commons/art.jpg', 'https://upload.wikimedia.org/other/art.jpg', 'https://upload.wikimedia.org:8443/wikipedia/commons/art.jpg', 'https://user:password@upload.wikimedia.org/wikipedia/commons/art.jpg', '//example.org/art.jpg', 'data:image/png;base64,AAAA', 'javascript:alert(1)']) {
    assert.equal(canOptimizeBlogImage(source), false, source);
  }
});
