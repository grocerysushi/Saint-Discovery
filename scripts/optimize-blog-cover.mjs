// Run from the linked project. Only --upload writes to the approved public artwork bucket.
// node scripts/optimize-blog-cover.mjs metadata.json reviewed-image.jpg output-directory [--upload]
import fs from 'node:fs/promises';
import path from 'node:path';
import { prepareArtwork, uploadArtwork, digest } from './blog-image-pipeline.mjs';
const [metadataFile, input, output, ...flags] = process.argv.slice(2);
if (!metadataFile || !input || !output || flags.some(f => f !== '--upload')) throw new Error('Usage: optimize-blog-cover.mjs metadata.json reviewed-image output-directory [--upload]');
const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
if (!metadata.cover || !metadata.coverAlt?.trim() || !metadata.coverCredit?.trim()) throw new Error('Reviewed source URL, accurate alt text and source/license credit are required.');
const directory = path.resolve(output);
const artwork = await prepareArtwork(await fs.readFile(input), directory);
const record = { ...artwork, sourceUrl: metadata.cover, sourceCredit: metadata.coverCredit, sourceAlt: metadata.coverAlt, sourceMetadataHash: digest(await fs.readFile(metadataFile)), status: 'prepared-local', reviewedInput: path.resolve(input) };
await fs.writeFile(path.join(directory, 'image-optimization.json'), JSON.stringify(record, null, 2) + '\n');
if (flags.includes('--upload')) {
  try {
    await uploadArtwork(record, process.cwd());
    const credit = metadata.coverCredit + ' WebP resized without cropping.';
    if (credit.length > 1000) throw new Error('Credit exceeds the editor limit. Revise without dropping required attribution.');
    const optimized = { ...metadata, cover: record.variants.at(-1).url, coverCredit: credit };
    const text = JSON.stringify(optimized, null, 2) + '\n';
    await fs.writeFile(path.join(directory, 'metadata.optimized.json'), text);
    record.optimizedMetadataHash = digest(text);
    record.cover = optimized.cover;
    record.status = 'uploaded-verified';
  } catch (error) {
    record.status = 'blocked'; record.blocker = error.message;
    await fs.writeFile(path.join(directory, 'image-optimization.json'), JSON.stringify(record, null, 2) + '\n');
    throw error;
  }
}
await fs.writeFile(path.join(directory, 'image-optimization.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ status: record.status, variants: record.variants.map(v => ({ width: v.width, bytes: v.bytes, url: v.url })), receipt: path.join(directory, 'image-optimization.json') }, null, 2));
