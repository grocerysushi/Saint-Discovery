import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

export const PUBLIC_BASE = 'https://f6zwvi29.us-east.insforge.app/api/storage/buckets/blog-images/objects/';
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export const widthsFor = width => [...new Set([384, 768, 1280].map(w => Math.min(w, width)))];
export async function prepareArtwork(bytes, directory) {
  const original = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
  if (!['jpeg', 'png', 'webp', 'avif', 'tiff'].includes(original.format) || (original.pages ?? 1) > 1) throw new Error('Use a single reviewed raster image, not animated artwork.');
  const normalized = await sharp(bytes, { limitInputPixels: 40000000 }).rotate().png().toBuffer();
  const { width, height } = await sharp(normalized).metadata();
  const hash = digest(Buffer.concat([bytes, Buffer.from('blog-webp-v1-q78-70-62-54')])).slice(0, 32);
  await fs.mkdir(directory, { recursive: true });
  const originalFile = path.join(directory, `original.${original.format}`);
  await fs.writeFile(originalFile, bytes);
  const variants = [];
  for (const w of widthsFor(width)) {
    let image;
    for (const quality of [78, 70, 62, 54]) {
      image = await sharp(normalized).resize({ width: w, withoutEnlargement: true }).webp({ quality }).toBuffer();
      if (image.length <= 300000) break;
    }
    if (image.length > 300000) throw new Error(`The ${w}px image exceeds the 300KB publication budget. Review a simpler source or compression settings.`);
    const key = `v1-${hash}-${width}x${height}-${w}.webp`;
    const file = path.join(directory, key);
    await fs.writeFile(file, image);
    const dimensions = await sharp(image).metadata();
    variants.push({ key, file, width: w, height: dimensions.height, bytes: image.length, sha256: digest(image), url: PUBLIC_BASE + key });
  }
  return { version: 1, originalFile, originalSha256: digest(bytes), originalBytes: bytes.length, width, height, variants };
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
