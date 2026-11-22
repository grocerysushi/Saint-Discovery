import { TRACELEAF_ID, TRACELEAF_PATH } from "@/lib/traceleaf";

const canonicalOrigin = "https://www.saintdiscoveryquiz.com";
const apexOrigin = "https://saintdiscoveryquiz.com";
const maxPayloadBytes = 2048;
const site = "saint-discovery-quiz";

function response(status: number) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store" } });
}

async function readPayload(request: Request): Promise<Record<string, unknown> | undefined> {
  if (!request.body || Number(request.headers.get("content-length")) > maxPayloadBytes) return;
  const reader = request.body.getReader();
  const buffer = new Uint8Array(maxPayloadBytes);
  let length = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (length + chunk.value.length > maxPayloadBytes) {
        void reader.cancel().catch(() => undefined);
        return;
      }
      buffer.set(chunk.value, length);
      length += chunk.value.length;
    }
    const payload: unknown = JSON.parse(new TextDecoder().decode(buffer.subarray(0, length)));
    if (payload && typeof payload === "object" && !Array.isArray(payload)) return payload as Record<string, unknown>;
  } catch {
    return;
  } finally {
    reader.releaseLock();
  }
}

function referrerOrigin(value: unknown): string {
  if (typeof value !== "string" || value.length > 255) return "";
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password ||
      url.origin === canonicalOrigin || url.origin === apexOrigin) return "";
    return url.origin;
  } catch {
    return "";
  }
}

function coarseDevice(agent: string | null) {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(agent ?? "")) return "Tablet";
  if (/Mobile|iPhone|iPod|Android/i.test(agent ?? "")) return "Mobile";
  return "Desktop";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin !== canonicalOrigin && origin !== apexOrigin) || (fetchSite && fetchSite !== "same-origin")) return response(403);
  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return response(204);
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") return response(415);

  const collector = process.env.TRACELEAF_COLLECTOR_URL;
  const token = process.env.TRACELEAF_SITES_TOKEN;
  if (!collector || !token) return response(404);
  const payload = await readPayload(request);
  if (!payload || typeof payload.path !== "string" || payload.path.length > 180 || !TRACELEAF_PATH.test(payload.path) ||
    typeof payload.visitor !== "string" || !TRACELEAF_ID.test(payload.visitor) ||
    typeof payload.session !== "string" || !TRACELEAF_ID.test(payload.session)) return response(400);

  const { type, name, path, visitor, session } = payload;
  if (type !== "pageview" && (type !== "event" || path !== "/quiz" || (name !== "quiz_start" && name !== "quiz_complete"))) {
    return response(400);
  }
  try {
    const target = new URL(collector);
    if (target.protocol !== "https:" || target.username || target.password || target.pathname !== "/api/collect" ||
      target.search || target.hash) return response(503);
    const result = await fetch(target, {
      method: "POST",
      body: JSON.stringify({
        site, type, ...(type === "event" ? { name } : {}), path, visitor, session,
        referrer: referrerOrigin(payload.referrer),
      }),
      headers: {
        "Content-Type": "application/json",
        "OAI-Sites-Authorization": `Bearer ${token}`,
        Origin: origin,
        "User-Agent": coarseDevice(request.headers.get("user-agent")),
      },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return response(result.status === 204 ? 204 : 503);
  } catch {
    return response(503);
  }
}
