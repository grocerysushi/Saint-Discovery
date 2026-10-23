import manifest from './data/responsive-images.json';
type PreparedImage = { width: number; height: number; variants: [number, string][] };
export function preparedImage(src: string): PreparedImage | undefined {
  let key = src;
  try {
    const url = new URL(src);
    for (const name of [...url.searchParams.keys()]) if (name.startsWith('utm_')) url.searchParams.delete(name);
    key = url.href;
  } catch { /* Relative bundled image. */ }
  return (manifest as unknown as Record<string, PreparedImage>)[key];
}
