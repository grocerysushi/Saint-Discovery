// Server-only configuration for the email-capture flow. None of these values are
// ever sent to the browser (no NEXT_PUBLIC_ prefix).
import { siteConfig } from "@/lib/seo";

// Vercel env values are LITERAL. If a value is pasted with the wrapping quotes
// from a .env example (e.g. RESEND_FROM="Saint Discovery <...>"), those quotes
// become part of the string and break things — Resend rejects a quoted `from`
// with a 422. dotenv strips them locally, so do the same here to be robust.
function env(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null) return undefined;
  const t = raw.trim();
  if (
    t.length >= 2 &&
    ((t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith("'") && t.endsWith("'")))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

export const RESEND_API_KEY = env("RESEND_API_KEY") ?? "";
// saintdiscoveryquiz.com is verified in Resend, so default to it. Falling back to
// onboarding@resend.dev would silently restrict delivery to the account owner's
// own address only, which reads as "emails not working" for every other recipient.
export const RESEND_FROM =
  env("RESEND_FROM") ?? "Saint Discovery <hello@saintdiscoveryquiz.com>";
export const RESEND_REPLY_TO = env("RESEND_REPLY_TO") || undefined;
export const EMAIL_POSTAL_ADDRESS = env("EMAIL_POSTAL_ADDRESS") ?? "";
export const EMAIL_TOKEN_SECRET = env("EMAIL_TOKEN_SECRET") ?? "";

// Fixed origin for links embedded in emails. Deliberately NOT derived from the
// request Host / X-Forwarded-Host header: trusting those would let an attacker
// get us to email victims links pointing at their domain (phishing under our
// brand). In production leave EMAIL_LINK_BASE_URL unset so this falls back to the
// canonical site URL; set it locally to point confirmation links at the dev server.
export function emailLinkOrigin(): string {
  const raw = env("EMAIL_LINK_BASE_URL") || siteConfig.url;
  return raw.replace(/\/+$/, "");
}
