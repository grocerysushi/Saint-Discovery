import { NextResponse } from "next/server";
import {
  RESEND_API_KEY,
  RESEND_FROM,
  RESEND_REPLY_TO,
  EMAIL_POSTAL_ADDRESS,
  EMAIL_TOKEN_SECRET,
  emailLinkOrigin,
} from "@/lib/emails/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY diagnostic — reports whether the running deployment has the email env
// vars wired up. Exposes presence/lengths only, never secret values. Remove after
// confirming production config.
export async function GET() {
  return NextResponse.json(
    {
      resendKey: RESEND_API_KEY ? "set" : "MISSING",
      resendKeyChars: RESEND_API_KEY.length,
      resendKeyPrefix: RESEND_API_KEY.slice(0, 3),
      from: RESEND_FROM,
      replyTo: RESEND_REPLY_TO ?? null,
      tokenSecretChars: EMAIL_TOKEN_SECRET.length,
      postalAddressSet: Boolean(EMAIL_POSTAL_ADDRESS),
      linkOrigin: emailLinkOrigin(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
