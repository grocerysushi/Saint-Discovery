// Server-only configuration for the email-capture flow. None of these values are
// ever sent to the browser (no NEXT_PUBLIC_ prefix).
import { siteConfig } from "@/lib/seo";

export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const RESEND_FROM =
  process.env.RESEND_FROM ?? "Saint Discovery <onboarding@resend.dev>";
export const RESEND_REPLY_TO = process.env.RESEND_REPLY_TO || undefined;
export const EMAIL_POSTAL_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS ?? "";
export const EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET ?? "";

// Fixed origin for links embedded in emails. Deliberately NOT derived from the
// request Host / X-Forwarded-Host header: trusting those would let an attacker
// get us to email victims links pointing at their domain (phishing under our
// brand). In production leave EMAIL_LINK_BASE_URL unset so this falls back to the
// canonical site URL; set it locally to point confirmation links at the dev server.
export function emailLinkOrigin(): string {
  const raw = process.env.EMAIL_LINK_BASE_URL || siteConfig.url;
  return raw.replace(/\/+$/, "");
}
