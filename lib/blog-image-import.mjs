import { processArtwork, digest, PUBLIC_BASE } from './blog-image-processing.mjs';

export function allowedImageSource(value) {
  try {
    const u = new URL(value, 'https://www.saintdiscoveryquiz.com');
    if (u.protocol !== 'https:' || u.port || u.username || u.password || u.hash || u.href.length > 2000) return null;
    const allowed = ((u.hostname === 'upload.wikimedia.org' || u.hostname === 'thumb.wikimedia.org') && u.pathname.startsWith('/wikipedia/commons/'))
      || (u.hostname === 'commons.wikimedia.org' && u.pathname.startsWith('/wiki/Special:Redirect/file/'))
      || (u.hostname === 'images.metmuseum.org' && u.pathname.startsWith('/CRDImages/'))
      || (u.hostname === 'www.saintdiscoveryquiz.com' && u.pathname.startsWith('/images/'))
      || (u.href.startsWith(PUBLIC_BASE) && !u.search);
    return allowed ? u.href : null;
  } catch { return null; }
}

export async function readLimited(body, limit) {
  if (!body) throw new Error('The image is empty.');
  const reader = body.getReader(); const parts = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new Error('Image exceeds the download or upload size limit.'); }
      parts.push(value);
    }
    return Buffer.concat(parts);
  } finally { reader.releaseLock(); }
}

export async function downloadArtwork(input, request = fetch) {
  let url = allowedImageSource(input);
  if (!url) throw new Error('This image host is not supported for URL imports. Download the image, then use Upload an image.');
  for (let i = 0; i < 5; i++) {
    const r = await request(url, { redirect: 'manual', headers: { 'User-Agent': 'SaintDiscoveryArtwork/1.0 (saintdiscoveryquiz.com)' }, signal: AbortSignal.timeout(20000) });
    if ([301,302,303,307,308].includes(r.status)) {
      await r.body?.cancel();
      const location = r.headers.get('location');
      url = location ? allowedImageSource(new URL(location, url).href) : null;
      if (!url) throw new Error('Image redirected to an unsupported destination. Download it and upload the file instead.');
      continue;
    }
    if (r.status !== 200 || !r.headers.get('content-type')?.startsWith('image/')) { await r.body?.cancel(); throw new Error('The image URL did not return an image. Download and upload the file instead.'); }
    return readLimited(r.body, 10000000);
  }
  throw new Error('Too many image redirects. Upload the file instead.');
}

/** Upload callback uses only the already-authorized editor's SDK client. */
export async function storeArtwork(bytes, upload, request = fetch) {
  const artwork = await processArtwork(bytes);
  const variants = [];
  for (const { buffer, ...variant } of artwork.variants) {
    const existing = await request(variant.url, { signal: AbortSignal.timeout(15000) });
    if (existing.status === 200) {
      if (digest(await readLimited(existing.body, 300000)) !== variant.sha256) throw new Error('A stored image conflicts with this file. Your image has not been inserted.');
    } else {
      await existing.body?.cancel();
      if (existing.status !== 404) throw new Error('Image storage is temporarily unavailable. Try again.');
      const saved = await upload(variant.key, buffer, 'image/webp');
      if (saved.key !== variant.key || !saved.url) throw new Error('Image storage returned an unexpected result. Try again.');
      const check = await request(variant.url, { signal: AbortSignal.timeout(15000) });
      if (check.status !== 200 || !check.headers.get('content-type')?.includes('image/webp') || digest(await readLimited(check.body, 300000)) !== variant.sha256) throw new Error('The uploaded image could not be verified. Try again before inserting it.');
    }
    variants.push({ ...variant, storage: { key: variant.key, url: variant.url } });
  }
  // Preserve the URL/key pair and source hash outside the transient API response.
  const receipt = { version: 1, originalSha256: artwork.originalSha256, width: artwork.width, height: artwork.height, variants };
  const receiptKey = variants.at(-1).key.replace(/-\d+\.webp$/, '-receipt.json');
  const receiptUrl = PUBLIC_BASE + receiptKey;
  const exists = await request(receiptUrl, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
  if (exists.status === 404) await upload(receiptKey, Buffer.from(JSON.stringify(receipt)), 'application/json');
  else if (exists.status !== 200) throw new Error('Image receipt could not be saved. Try again.');
  return { src: variants.at(-1).url, variants, receiptUrl, width: artwork.width, height: artwork.height };
}
