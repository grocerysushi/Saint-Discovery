import { type NextRequest, NextResponse } from "next/server";
import { getInsforgeAdmin } from "@/lib/insforge-admin";
import { getSaintBySlug } from "@/lib/saints";
import { verifyToken, createToken } from "@/lib/emails/tokens";
import { buildResultEmail } from "@/lib/emails/render";
import { sendEmail } from "@/lib/emails/resend";
import {
  emailLinkOrigin,
  EMAIL_POSTAL_ADDRESS,
  RESEND_REPLY_TO,
} from "@/lib/emails/config";
import { circuitAllows, reserveEmailSend } from "@/lib/emails/rateLimit";
import { CONFIRM_RETRY_COOKIE, CONFIRM_RETRY_TTL } from "@/lib/emails/confirmation-flow";
import saintDbIds from "@/lib/data/saint-db-ids.json";
import { CONVERSION_COOKIE, CONVERSION_TTL, createConversionReceipt } from "@/lib/emails/conversion-receipt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNSUB_TTL = 60 * 60 * 24 * 730; // ~2 years (unsubscribe links must last)

// Relative same-origin redirect after POST. 303 forces the browser to follow
// with GET; a relative Location avoids reconstructing an origin from headers.
function seeOther(path: string, newlyConfirmed = false, retryToken = "") {
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: path, "Cache-Control": "no-store" },
  });
  response.cookies.set(CONVERSION_COOKIE, newlyConfirmed ? createConversionReceipt() : "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/subscribed", maxAge: newlyConfirmed ? CONVERSION_TTL : 0,
  });
  response.cookies.set(CONFIRM_RETRY_COOKIE, retryToken, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/subscribed", maxAge: retryToken ? CONFIRM_RETRY_TTL : 0,
  });
  return response;
}

// State change happens ONLY here, on a real POST from the /confirm page's button
// — never on a GET, so link scanners/prefetchers can't auto-confirm.
export async function POST(request: NextRequest) {
  let token = request.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    try {
      const form = await request.formData();
      token = String(form.get("token") ?? "");
    } catch {
      token = "";
    }
  }

  const verified = verifyToken(token, "confirm");
  if (!verified) return seeOther("/subscribed?status=invalid");

  const saint = await getSaintBySlug(verified.slug);
  if (!saint || saint.kind === "unresolved") return seeOther("/subscribed?status=invalid");

  // The RPC serializes confirmations per address. Only a newly saved row
  // qualifies as a subscription conversion; an outage or replay never does.
  let newlyConfirmed = false;
  let subscriptionSaved = false;
  try {
    const { data, error } = await getInsforgeAdmin().database.rpc("record_confirmed_subscription", {
      p_email: verified.email,
      p_saint_id: (saintDbIds as Record<string, string | undefined>)[saint.slug] ?? null,
    });
    newlyConfirmed = !error && data === true;
    subscriptionSaved = !error && typeof data === "boolean";
  } catch {
    // Show a retry instead of claiming the subscription was saved.
  }

  if (!subscriptionSaved) {
    console.warn("[confirm] subscription_save_failed");
    return seeOther("/subscribed?status=save_failed", false, token);
  }

  // Returning subscribers can request their result too. Signed recipient tokens
  // and the separate result-email cooldown bound repeated sends.
  const origin = emailLinkOrigin();
  const unsubToken = createToken({
    email: verified.email,
    slug: saint.slug,
    purpose: "unsub",
    ttlSeconds: UNSUB_TTL,
  });
  const { subject, html, text } = buildResultEmail({
    saint,
    saintUrl: `${origin}/saints/${saint.slug}`,
    unsubscribeUrl: `${origin}/unsubscribe?token=${encodeURIComponent(
      unsubToken
    )}`,
    siteUrl: origin,
    postalAddress: EMAIL_POSTAL_ADDRESS,
  });
  // Bound outbound volume per instance so a valid token replayed in a loop can't
  // burn the Resend quota. A legitimate single confirm is far under the cap.
  let delivered = false;
  const reservation = reserveEmailSend(verified.email, "result");
  if (!reservation.allowed) return seeOther(`/subscribed?status=cooldown&retryAfter=${reservation.retryAfter}`, newlyConfirmed, token);
  if (circuitAllows()) {
    const sent = await sendEmail({
      to: verified.email,
      subject,
      html,
      text,
      listUnsubscribeUrl: `${origin}/api/unsubscribe?token=${encodeURIComponent(
        unsubToken
      )}`,
      listUnsubscribeMailto: RESEND_REPLY_TO,
    });
    if (!sent.ok) console.warn("[confirm] result_send_failed", { code: sent.code });
    else console.info("[confirm] result_send_accepted", { messageId: sent.id });
    delivered = sent.ok;
  } else {
    console.warn("[confirm] result email skipped: send circuit open");
  }

  // Only claim acceptance when the provider accepted the send. On a skip or failure
  // the confirm token is still valid (7-day TTL), so the "pending" page invites a
  // re-click rather than falsely promising an email that never left.
  return seeOther(
    delivered ? "/subscribed?status=ok" : "/subscribed?status=pending",
    newlyConfirmed,
    token
  );
}
