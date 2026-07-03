import crypto from "node:crypto";

// Best-effort, in-memory abuse controls for the public /api/subscribe endpoint.
// Honest caveat: on Vercel Fluid Compute a module-scope Map survives across
// invocations on the SAME warm instance but is NOT shared globally, so a burst
// spread across instances/regions can slip past. This stops the trivial single-
// attacker/single-loop case and protects the send quota; swap the internals for
// Vercel KV / Upstash (INCR+EXPIRE) if real abuse appears — the call sites don't
// change.

const MAX_MAP = 5000;

function evictIfLarge(map: Map<string, unknown>) {
  if (map.size <= MAX_MAP) return;
  let i = 0;
  const half = Math.floor(map.size / 2);
  for (const k of map.keys()) {
    map.delete(k);
    if (++i >= half) break;
  }
}

// --- Per-IP token bucket (~5 attempts/hour) ---------------------------------
interface Bucket {
  tokens: number;
  last: number;
}
const ipBuckets = new Map<string, Bucket>();
const IP_CAP = 5;
const IP_REFILL_PER_SEC = 5 / 3600;

export function allowByIp(ip: string): boolean {
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b) {
    b = { tokens: IP_CAP, last: now };
    ipBuckets.set(ip, b);
    evictIfLarge(ipBuckets);
  }
  const elapsedSec = (now - b.last) / 1000;
  b.tokens = Math.min(IP_CAP, b.tokens + elapsedSec * IP_REFILL_PER_SEC);
  b.last = now;
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}

// --- Per-email cooldown (protects the victim from inbox-bombing) ------------
// Stores a hash of the email, never the plaintext.
const emailCooldown = new Map<string, number>();
const COOLDOWN_MS = 15 * 60 * 1000;

export function allowByEmail(email: string): boolean {
  const now = Date.now();
  const key = crypto.createHash("sha256").update(email).digest("hex");
  const last = emailCooldown.get(key);
  if (last && now - last < COOLDOWN_MS) return false;
  emailCooldown.set(key, now);
  evictIfLarge(emailCooldown);
  return true;
}

// --- Per-instance circuit breaker (caps outbound sends/minute) -------------
let sentWindow: number[] = [];
const CB_WINDOW_MS = 60 * 1000;
const CB_MAX = 30;

export function circuitAllows(): boolean {
  const now = Date.now();
  sentWindow = sentWindow.filter((ts) => now - ts < CB_WINDOW_MS);
  if (sentWindow.length >= CB_MAX) return false;
  sentWindow.push(now);
  return true;
}

// Trust the leftmost X-Forwarded-For entry, which Vercel sets to the real client
// IP. Falls back to x-real-ip, then a constant so limiting still buckets.
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
