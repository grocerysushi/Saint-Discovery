import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { processArtwork, PUBLIC_BASE, digest, widthsFor } from '../lib/blog-image-processing.mjs';

export { PUBLIC_BASE, digest, widthsFor };
export async function prepareArtwork(bytes, directory) {
  const artwork = await processArtwork(bytes);
  await fs.mkdir(directory, { recursive: true });
  const originalFile = path.join(directory, `original.${artwork.format}`);
  await fs.writeFile(originalFile, bytes);
  const variants = [];
  for (const { buffer, ...variant } of artwork.variants) {
    const file = path.join(directory, variant.key);
    await fs.writeFile(file, buffer);
    variants.push({ ...variant, file });
  }
  return { ...artwork, originalFile, variants };
}

export async function verifyVariant(variant) {
  const response = await fetch(variant.url, { signal: AbortSignal.timeout(30000) });
  if (response.status !== 200) throw new Error(`Image verification returned HTTP ${response.status}: ${variant.key}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!response.headers.get('content-type')?.includes('image/webp') || digest(bytes) !== variant.sha256) throw new Error(`Stored image differs from reviewed file: ${variant.key}`);
  return { status: 200, bytes: bytes.length, verifiedAt: new Date().toISOString() };
}

export async function uploadArtwork(artwork, cliRoot) {
  const cli = path.join(cliRoot, 'node_modules/@insforge/cli/dist/index.js');
  const buckets = spawnSync(process.execPath, [cli, 'storage', 'buckets', '--json'], { cwd: cliRoot, encoding: 'utf8', windowsHide: true });
  if (buckets.status !== 0) throw new Error('Unable to check the linked storage bucket. No upload attempted.');
  const list = JSON.parse(buckets.stdout);
  if (!Array.isArray(list) || !list.some(b => b.name === 'blog-images' && b.public === true)) throw new Error('The approved public blog-images bucket is unavailable. Do not create/change buckets automatically.');
  for (const variant of artwork.variants) {
    const existing = await fetch(variant.url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
    if (existing.status === 404) {
      const result = spawnSync(process.execPath, [cli, 'storage', 'upload', variant.file, '--bucket', 'blog-images', '--key', variant.key, '--content-type', 'image/webp', '--json'], { cwd: cliRoot, encoding: 'utf8', windowsHide: true });
      if (result.status !== 0) throw new Error(`Image upload failed: ${variant.key}. Reconcile storage before retrying.`);
      const uploaded = JSON.parse(result.stdout);
      if (uploaded.key !== variant.key || typeof uploaded.url !== 'string') throw new Error('Unexpected upload result. Reconcile storage before retrying.');
      variant.storage = { key: uploaded.key, url: uploaded.url };
    } else if (existing.status !== 200) throw new Error(`Storage check failed: HTTP ${existing.status}.`);
    else variant.storage = { key: variant.key, url: variant.url };
    variant.verification = await verifyVariant(variant);
  }
  return artwork;
}
