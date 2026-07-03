import crypto from "node:crypto";
import { EMAIL_TOKEN_SECRET } from "./config";

// Stateless double opt-in tokens. We SIGN (HMAC-SHA256), we do not encrypt —
// the email + slug are not secret; we only need integrity + authenticity so a
// confirmation link can't be forged or tampered with. Format:
//   token = base64url(JSON payload) + "." + base64url(HMAC(secret, payloadB64))
// The purpose is part of the signed payload, so a "confirm" token can never be
// replayed as an "unsub" token (or vice-versa).

export type TokenPurpose = "confirm" | "unsub";

interface TokenPayload {
  e: string; // email
  s: string; // saint slug
  p: TokenPurpose;
  exp: number; // unix seconds
}

// Fail CLOSED on a missing/weak secret. crypto.createHmac("sha256", "") does not
// throw — it just signs with a publicly-known empty key, which would silently turn
// every token into a forgeable one (arbitrary insert/delete + victim email-bombing)
// in any environment where EMAIL_TOKEN_SECRET was forgotten. So refuse to operate.
function secretUsable(): boolean {
  return typeof EMAIL_TOKEN_SECRET === "string" && EMAIL_TOKEN_SECRET.length >= 32;
}

function sign(payloadB64: string): string {
  return crypto
    .createHmac("sha256", EMAIL_TOKEN_SECRET)
    .update(payloadB64)
    .digest("base64url");
}

// crypto.timingSafeEqual throws when the two buffers differ in length, and an
// attacker controls the signature length, so guard on length first (length is
// not itself secret).
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function createToken(input: {
  email: string;
  slug: string;
  purpose: TokenPurpose;
  ttlSeconds: number;
}): string {
  if (!secretUsable()) {
    throw new Error("EMAIL_TOKEN_SECRET must be set (>= 32 chars)");
  }
  const exp = Math.floor(Date.now() / 1000) + input.ttlSeconds;
  const payload: TokenPayload = {
    e: input.email,
    s: input.slug,
    p: input.purpose,
    exp,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${payloadB64}.${sign(payloadB64)}`;
}

// Returns the verified { email, slug } only if the signature is valid, the
// purpose matches exactly, and the token has not expired. Never throws.
export function verifyToken(
  token: unknown,
  requiredPurpose: TokenPurpose
): { email: string; slug: string } | null {
  // Fail closed: if the secret is unusable, no token can ever validate.
  if (!secretUsable()) return null;
  if (typeof token !== "string" || token.length === 0 || token.length > 4096) {
    return null;
  }
  const dot = token.lastIndexOf(".");
  if (dot <= 0 || dot >= token.length - 1) return null;

  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Verify the signature over the payload string EXACTLY as received (do not
  // re-serialize parsed JSON — canonicalization drift would break valid tokens).
  if (!safeEqual(sig, sign(payloadB64))) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as TokenPayload;
  } catch {
    return null;
  }

  if (!payload || payload.p !== requiredPurpose) return null;
  if (typeof payload.e !== "string" || typeof payload.s !== "string") return null;
  if (typeof payload.exp !== "number" || Date.now() / 1000 >= payload.exp) {
    return null;
  }
  return { email: payload.e, slug: payload.s };
}
