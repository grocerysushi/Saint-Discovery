export type OptimizedEditorImage = { src: string; receiptUrl: string; variants: { width: number; bytes: number; url: string; storage: { key: string; url: string } }[] };
export async function optimizeEditorImage(source: File | string, signal: AbortSignal): Promise<OptimizedEditorImage> {
  const body = typeof source === 'string' ? JSON.stringify({ url: source }) : new FormData();
  if (body instanceof FormData) body.set('file', source as File);
  const headers = typeof source === 'string' ? { 'Content-Type': 'application/json' } : undefined;
  let response = await fetch('/api/blog/admin/images', { method: 'POST', body, headers, signal });
  if (response.status === 401) {
    const refreshed = await fetch('/api/blog/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'refresh' }), signal });
    if (refreshed.ok) response = await fetch('/api/blog/admin/images', { method: 'POST', body, headers, signal });
  }
  const result = await response.json();
  if (!response.ok || !result.image?.src) throw new Error(result.error || 'The image could not be optimized. Please try again.');
  return result.image;
}
