import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Import reviewed illustrations generated ahead of time. No API key or paid
// generation endpoint is exposed to visitors. Run with one or more asset folders.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = process.argv.slice(2);
if (!sources.length) throw new Error('Usage: node scripts/import-generated-saints.mjs <asset-folder> [more-folders]');
const saints = JSON.parse(await readFile(join(root, 'lib/data/saints.json'), 'utf8'));
const known = new Map(saints.map(s => [s.slug, s]));
const manifestPath = join(root, 'lib/data/saint-generated-images.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const destination = join(root, 'public/images/generated-saints');
await mkdir(destination, { recursive: true });
let count = 0;
for (const source of sources) {
  const directory = resolve(source);
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !/\.(png|jpe?g|webp)$/i.test(entry.name)) continue;
    const slug = basename(entry.name, extname(entry.name));
    const saint = known.get(slug);
    if (!saint) throw new Error(`Unknown saint slug: ${slug}`);
    if (manifest[slug]) continue;
    await sharp(join(directory, entry.name)).rotate()
      .resize({ width: 1100, height: 1467, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 }).toFile(join(destination, `${slug}.webp`));
    manifest[slug] = {
      src: `/images/generated-saints/${slug}.webp`,
      alt: `AI-generated artistic interpretation of Saint ${saint.name}`,
      credit: 'Saint Discovery',
      license: 'AI-generated illustration',
      source: `/saints/${slug}`,
      generated: true,
    };
    count++;
  }
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Imported ${count} illustrations; ${Object.keys(manifest).length} total.`);
