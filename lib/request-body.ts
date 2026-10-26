export class RequestBodyTooLarge extends Error {}

// Enforce a byte budget while reading, including chunked requests with no length.
export async function readSmallBody(request: Request, limit = 4096): Promise<string> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > limit) throw new RequestBodyTooLarge();
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit) {
        await reader.cancel().catch(() => {});
        throw new RequestBodyTooLarge();
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally {
    reader.releaseLock();
  }
}
