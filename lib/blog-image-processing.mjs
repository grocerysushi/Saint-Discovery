import { createHash } from 'node:crypto';
import sharp from 'sharp';

export const PUBLIC_BASE = 'https://f6zwvi29.us-east.insforge.app/api/storage/buckets/blog-images/objects/';
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export const widthsFor = width => [...new Set([384, 768, 1280].map(w => Math.min(w, width)))];

/** Optimize once at insertion/publication time, never on a reader request. */
export async function processArtwork(bytes) {
  const original = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
  // Sharp identifies AVIF as its HEIF container format.
  if (!['jpeg', 'png', 'webp', 'avif', 'heif', 'tiff'].includes(original.format) || (original.pages ?? 1) > 1) throw new Error('Choose a single JPG, PNG, WebP, AVIF or TIFF image, not animated artwork.');
  const normalized = await sharp(bytes, { limitInputPixels: 40000000 }).rotate().png().toBuffer();
  const { width, height } = await sharp(normalized).metadata();
  const hash = digest(Buffer.concat([bytes, Buffer.from('blog-webp-v1-q78-70-62-54')])).slice(0, 32);
  const variants = [];
  for (const w of widthsFor(width)) {
    let image;
    for (const quality of [78, 70, 62, 54]) {
      image = await sharp(normalized).resize({ width: w, withoutEnlargement: true }).webp({ quality }).toBuffer();
      if (image.length <= 300000) break;
    }
    if (image.length > 300000) throw new Error('This image cannot meet the 300 KB size limit without further review. Choose a simpler or smaller source.');
    const key = `v1-${hash}-${width}x${height}-${w}.webp`;
    const dimensions = await sharp(image).metadata();
    variants.push({ key, width: w, height: dimensions.height, bytes: image.length, sha256: digest(image), url: PUBLIC_BASE + key, buffer: image });
  }
  return { version: 1, format: original.format, originalSha256: digest(bytes), originalBytes: bytes.length, width, height, variants };
}
