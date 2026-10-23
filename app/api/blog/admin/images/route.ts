import { blogResponse, requireBlogEditor, sameOrigin } from '@/lib/blog-server';
import { downloadArtwork, readLimited, storeArtwork } from '@/lib/blog-image-import.mjs';

export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!sameOrigin(request)) return blogResponse({ error: 'Invalid request origin.' }, 403);
  const client = await requireBlogEditor().catch(() => null);
  if (!client) return blogResponse({ error: 'Sign in with your blog editor account before adding images.' }, 401);
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 4200000) return blogResponse({ error: 'Choose an image under 4 MB.' }, 413);
    const type = request.headers.get('content-type') ?? '';
    const body = await readLimited(request.body, type.includes('application/json') ? 4096 : 4200000);
    let bytes: Buffer;
    if (type.includes('application/json')) {
      const input = JSON.parse(body.toString('utf8'));
      if (typeof input.url !== 'string') return blogResponse({ error: 'Enter an image URL.' }, 400);
      bytes = await downloadArtwork(input.url);
    } else if (type.startsWith('multipart/form-data')) {
      const form = await new Response(new Uint8Array(body), { headers: { 'Content-Type': type } }).formData();
      const file = form.get('file');
      if (!(file instanceof File) || file.size > 4000000 || !file.size) return blogResponse({ error: 'Choose an image under 4 MB.' }, 400);
      bytes = Buffer.from(await file.arrayBuffer());
    } else return blogResponse({ error: 'Unsupported image request.' }, 415);
    const image = await storeArtwork(bytes, async (key: string, data: Buffer, mime: string) => {
      const result = await client.storage.from('blog-images').upload(key, new File([new Uint8Array(data)], key, { type: mime }));
      if (result.error || !result.data) throw new Error('Image upload failed. Your existing image has not changed; please try again.');
      return result.data;
    });
    return blogResponse({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const safe = /^(Choose|Image |This image|The image|Too many|A stored|Your |The uploaded|The input)/.test(message);
    return blogResponse({ error: safe ? message : 'The image could not be optimized. Try a valid JPG, PNG or WebP file under 4 MB.' }, 422);
  }
}
