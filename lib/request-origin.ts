export function sameOrigin(request: Pick<Request, "url" | "headers">) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    // Next's internal URL can use localhost even when the browser uses 127.0.0.1.
    return parsed.host === host && parsed.protocol === new URL(request.url).protocol
      && ["http:", "https:"].includes(parsed.protocol) && parsed.origin === origin;
  } catch { return false; }
}
