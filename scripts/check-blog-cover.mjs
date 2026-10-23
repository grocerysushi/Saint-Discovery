// Mandatory pre-publication gate for daily SQL publishing; throws before DB writes.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { digest, verifyVariant, widthsFor, PUBLIC_BASE } from './blog-image-pipeline.mjs';
export async function checkBlogCover(postFile, receiptFile, optimizedMetadataFile, verify = verifyVariant) {
  const post = JSON.parse(await fs.readFile(postFile, 'utf8'));
  const receipt = JSON.parse(await fs.readFile(receiptFile, 'utf8'));
  const metadataText = await fs.readFile(optimizedMetadataFile, 'utf8');
  const metadata = JSON.parse(metadataText);
  assert.equal(receipt.status, 'uploaded-verified', 'Cover optimization must succeed before publication');
  assert.equal(digest(metadataText), receipt.optimizedMetadataHash, 'Optimized metadata changed after verification');
  assert.equal(metadata.cover, receipt.cover);
  assert.equal(metadata.coverAlt, receipt.sourceAlt);
  assert.equal(metadata.coverCredit, receipt.sourceCredit + ' WebP resized without cropping.');
  assert.deepEqual(receipt.variants.map(v => v.width), widthsFor(receipt.width), 'Every responsive width must exist');
  assert.equal(receipt.cover, receipt.variants.at(-1).url);
  for (const variant of receipt.variants) {
    assert.equal(variant.url, PUBLIC_BASE + variant.key);
    assert(variant.bytes > 0 && variant.bytes <= 300000, 'Variant exceeds its byte budget');
  }
  for (const content of [post.draft, post.published]) {
    assert(content, 'Matching editable draft and published content are required');
    for (const key of ['cover', 'coverAlt', 'coverCredit']) assert.equal(content[key], metadata[key], `Post ${key} must match optimized metadata`);
    function walk(node) {
      if (node?.type === 'image') assert.equal(node.attrs?.src, receipt.cover, 'Additional body images need their own reviewed optimization gate; do not publish unoptimized image URLs');
      for (const child of node?.content ?? []) walk(child);
    }
    walk(content.body);
  }
  for (const variant of receipt.variants) await verify(variant);
  return true;
}
