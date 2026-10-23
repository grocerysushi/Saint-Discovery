import manifest from './data/responsive-images.json';
type PreparedImage = { width: number; height: number; variants: [number, string][] };
export function preparedImage(src: string): PreparedImage | undefined {
  let key = src;
  try {
    const url = new URL(src);
    for (const name of [...url.searchParams.keys()]) if (name.startsWith('utm_')) url.searchParams.delete(name);
    key = url.href;
  } catch { /* Relative bundled image. */ }
  const bundled = (manifest as unknown as Record<string, PreparedImage>)[key];
  if (bundled) return bundled;
  // Daily publishing uploads every sibling before saving this cover URL.
  // No deployment or runtime Vercel transformation is needed for new covers.
  const match = key.match(/^(https:\/\/f6zwvi29\.us-east\.insforge\.app\/api\/storage\/buckets\/blog-images\/objects\/v1-[a-f0-9]{32}-)(\d+)x(\d+)-(\d+)\.webp$/);
  if (!match) return undefined;
  const width = Number(match[2]), height = Number(match[3]);
  if (width < 1 || height < 1 || width * height > 40000000) return undefined;
  const widths = [...new Set([384, 768, 1280].map(w => Math.min(w, width)))];
  if (!widths.includes(Number(match[4]))) return undefined;
  return { width, height, variants: widths.map(w => [w, `${match[1]}${width}x${height}-${w}.webp`]) };
}
