import { TRACELEAF_ARTICLE_PATH, TRACELEAF_ATTEMPT, TRACELEAF_ID, TRACELEAF_PATH, TRACELEAF_UTM } from "@/lib/traceleaf";

const canonicalOrigin = "https://www.saintdiscoveryquiz.com";
const apexOrigin = "https://saintdiscoveryquiz.com";
const maxPayloadBytes = 2048;
const site = "saint-discovery-quiz";

// Best-effort per-instance rate limits to prevent unauthenticated proxy abuse.
const MAX_IP_BUCKETS = 5000;
const IP_CAP = 120;
const IP_REFILL_PER_SEC = 2;
const INSTANCE_WINDOW_MS = 60_000;
const INSTANCE_MAX = 1000;

interface TokenBucket {
  tokens: number;
  last: number;
}
const ipBuckets = new Map<string, TokenBucket>();
let instanceWindow: number[] = [];

function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "unknown";
}

function allowTraceleafRequest(request: Request): boolean {
  const now = Date.now();
  instanceWindow = instanceWindow.filter((ts) => now - ts < INSTANCE_WINDOW_MS);
  if (instanceWindow.length >= INSTANCE_MAX) return false;

  const ip = clientIp(request);
  let bucket = ipBuckets.get(ip);
  if (!bucket) {
    if (ipBuckets.size >= MAX_IP_BUCKETS) {
      let removed = 0;
      const half = Math.floor(ipBuckets.size / 2);
      for (const key of ipBuckets.keys()) {
        ipBuckets.delete(key);
        if (++removed >= half) break;
      }
    }
    bucket = { tokens: IP_CAP, last: now };
    ipBuckets.set(ip, bucket);
  }
  const elapsedSec = Math.max(0, (now - bucket.last) / 1000);
  bucket.tokens = Math.min(IP_CAP, bucket.tokens + elapsedSec * IP_REFILL_PER_SEC);
  bucket.last = now;
  if (bucket.tokens < 1) return false;

  bucket.tokens -= 1;
  instanceWindow.push(now);
  return true;
}

function response(status: number, extraHeaders?: Record<string, string>) {
  return new Response(null, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
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

function campaignLabel(value: unknown) {
  if (typeof value !== "string") return;
  const label = value.trim();
  if (TRACELEAF_UTM.test(label)) return label;
}

function eventDetails(payload: Record<string, unknown>) {
  const { type, name, path } = payload;
  if (type === "pageview") return {
    utmSource: campaignLabel(payload.utmSource),
    utmMedium: campaignLabel(payload.utmMedium),
    utmCampaign: campaignLabel(payload.utmCampaign),
  };
  if (type !== "event") return;

  switch (name) {
    case "quiz_start":
    case "quiz_step":
    case "quiz_complete": {
      if (path !== "/quiz") return;
      const attempt = typeof payload.attempt === "string" && TRACELEAF_ATTEMPT.test(payload.attempt)
        ? payload.attempt.toLowerCase()
        : undefined;
      if (payload.attempt !== undefined && !attempt) return;
      if (name !== "quiz_step") return { attempt };
      const step = payload.step;
      if (attempt && typeof step === "number" && Number.isInteger(step) && step >= 1 && step <= 20) {
        return { attempt, step };
      }
      return;
    }
    case "quiz_load_error": return path === "/quiz" ? {} : undefined;
    case "directory_search": return path === "/" || path === "/resources" ? {} : undefined;
    case "article_to_quiz": return typeof path === "string" && TRACELEAF_ARTICLE_PATH.test(path) ? {} : undefined;
    case "app_store_click": return path === "/" && payload.placement === "home_promotion"
      ? { placement: payload.placement }
      : undefined;
    case "page_performance": {
      const durationMs = payload.durationMs;
      if (typeof durationMs === "number" && Number.isInteger(durationMs) && durationMs >= 1 && durationMs <= 60000) {
        return { durationMs };
      }
      return;
    }
  }
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
  if (!allowTraceleafRequest(request)) return response(429, { "Retry-After": "60" });
  const payload = await readPayload(request);
  if (!payload || typeof payload.path !== "string" || payload.path.length > 180 || !TRACELEAF_PATH.test(payload.path) ||
    typeof payload.visitor !== "string" || !TRACELEAF_ID.test(payload.visitor) ||
    typeof payload.session !== "string" || !TRACELEAF_ID.test(payload.session)) return response(400);

  const { type, name, path, visitor, session } = payload;
  const details = eventDetails(payload);
  if (!details) return response(400);
  try {
    const target = new URL(collector);
    if (target.protocol !== "https:" || target.username || target.password || target.pathname !== "/api/collect" ||
      target.search || target.hash) return response(503);
    const result = await fetch(target, {
      method: "POST",
      body: JSON.stringify({
        site, type, ...(type === "event" ? { name } : {}), path, visitor, session,
        referrer: referrerOrigin(payload.referrer), ...details,
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
