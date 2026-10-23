import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { prepareArtwork, digest } from '../scripts/blog-image-pipeline.mjs';
import { checkBlogCover } from '../scripts/check-blog-cover.mjs';
import { loadTs } from './load-ts.mjs';

test('publication artwork preserves proportions, caps sizes and works without a deployment manifest entry', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-image-test-'));
  try {
    const bytes = await sharp({ create: { width: 1600, height: 2400, channels: 3, background: '#a86' } }).jpeg().toBuffer();
    const result = await prepareArtwork(bytes, dir);
    assert.deepEqual(result.variants.map(v => v.width), [384, 768, 1280]);
    for (const v of result.variants) {
      assert.equal(v.height, v.width * 1.5);
      assert(v.bytes <= 300000);
      assert.equal((await sharp(await fs.readFile(v.file)).metadata()).format, 'webp');
    }
    const { preparedImage } = loadTs('lib/static-images.ts');
    const parsed = preparedImage(result.variants.at(-1).url);
    assert.equal(parsed.width, 1600);
    assert.deepEqual(Array.from(parsed.variants, v => Array.from(v)), result.variants.map(v => [v.width, v.url]));
    assert.equal(preparedImage(result.variants[0].url.replace('blog-images', 'private')), undefined);
    const small = await prepareArtwork(await sharp(bytes).resize(220).jpeg().toBuffer(), dir);
    assert.deepEqual(small.variants.map(v => v.width), [220]);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('publication gate rejects original URLs, changed credits, missing variants and failed remote checks', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-image-gate-'));
  try {
    const art = await prepareArtwork(await sharp({ create: { width: 500, height: 750, channels: 3, background: '#a86' } }).png().toBuffer(), dir);
    const metadata = { cover: art.variants.at(-1).url, coverAlt: 'Reviewed picture', coverCredit: 'Artist, public domain. WebP resized without cropping.' };
    const text = JSON.stringify(metadata);
    const receipt = { ...art, status: 'uploaded-verified', sourceAlt: metadata.coverAlt, sourceCredit: 'Artist, public domain.', cover: metadata.cover, optimizedMetadataHash: digest(text) };
    const post = { draft: metadata, published: structuredClone(metadata) };
    const paths = ['post.json','receipt.json','metadata.json'].map(f => path.join(dir,f));
    const save = async () => Promise.all([fs.writeFile(paths[0], JSON.stringify(post)),fs.writeFile(paths[1], JSON.stringify(receipt)),fs.writeFile(paths[2], text)]);
    await save(); let verified = 0;
    await checkBlogCover(...paths, async () => { verified++; });
    assert.equal(verified, 2);
    post.published.cover = 'https://example.com/huge.jpg'; await save();
    await assert.rejects(checkBlogCover(...paths, async()=>{}), /cover must match/);
    post.published = structuredClone(metadata); post.published.coverCredit = ''; await save();
    await assert.rejects(checkBlogCover(...paths, async()=>{}), /coverCredit must match/);
    post.published = structuredClone(metadata); await save();
    await assert.rejects(checkBlogCover(...paths, async()=>{throw new Error('Remote image missing');}), /Remote image missing/);
    receipt.variants.pop(); await save();
    await assert.rejects(checkBlogCover(...paths, async()=>{}), /Every responsive width/);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
