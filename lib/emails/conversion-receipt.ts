import crypto from "node:crypto";
import { EMAIL_TOKEN_SECRET } from "./config";

export const CONVERSION_COOKIE = "sd-confirmed-subscription";
export const CONVERSION_TTL = 15 * 60;
function signature(payload: string) {
  return crypto.createHmac("sha256", EMAIL_TOKEN_SECRET).update(`subscription-receipt:${payload}`).digest("base64url");
}
// Contains no email, saint, quiz answers or authentication credentials.
export function createConversionReceipt() {
  if (EMAIL_TOKEN_SECRET.length < 32) throw new Error("Email signing secret unavailable");
  const payload = `${crypto.randomUUID()}:${Math.floor(Date.now() / 1000) + CONVERSION_TTL}`;
  return `${payload}.${signature(payload)}`;
}
export function verifyConversionReceipt(value?: string): string | null {
  if (!value || value.length > 200 || EMAIL_TOKEN_SECRET.length < 32) return null;
  const match = /^([a-f0-9-]{36}):(\d+)\.([\w-]+)$/.exec(value);
  if (!match || Number(match[2]) <= Date.now() / 1000) return null;
  const expected = Buffer.from(signature(`${match[1]}:${match[2]}`));
  const actual = Buffer.from(match[3]);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected) ? match[1] : null;
}
