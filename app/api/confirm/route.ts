import { type NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { getSaintBySlug } from "@/lib/saints";
import { verifyToken, createToken } from "@/lib/emails/tokens";
import { getPostHogClient } from "@/lib/posthog-server";
import { buildResultEmail } from "@/lib/emails/render";
import { sendEmail } from "@/lib/emails/resend";
import {
  emailLinkOrigin,
  EMAIL_POSTAL_ADDRESS,
  RESEND_REPLY_TO,
} from "@/lib/emails/config";
import { circuitAllows } from "@/lib/emails/rateLimit";
import saintDbIds from "@/lib/data/saint-db-ids.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UNSUB_TTL = 60 * 60 * 24 * 730; // ~2 years (unsubscribe links must last)

// Relative same-origin redirect after POST. 303 forces the browser to follow
// with GET; a relative Location avoids reconstructing an origin from headers.
function seeOther(path: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: path, "Cache-Control": "no-store" },
  });
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
  if (!saint) return seeOther("/subscribed?status=invalid");

  // Record the signup, idempotently (one row per email). Best-effort — a backend
  // hiccup must never block the confirmation. postgrest-js resolves with
  // { data, error } instead of throwing, so inspect `error` explicitly.
  try {
    const { data: existing, error: selErr } = await insforge.database
      .from("email_signups")
      .select("id")
      .eq("email", verified.email)
      .limit(1);
    if (!selErr && !(Array.isArray(existing) && existing.length > 0)) {
      const saintId =
        (saintDbIds as Record<string, string | undefined>)[saint.slug] ?? null;
      await insforge.database
        .from("email_signups")
        .insert([{ email: verified.email, saint_id: saintId }]);
    }
  } catch {
    // ignore — delivering the result email below is the priority
  }

  // ALWAYS send the result email on a valid confirmation — it is the payoff the
  // user just confirmed for. (Sending only on first-ever signup meant anyone
  // already on the list — including returning users picking a new saint — got
  // nothing.) A confirm token is single-recipient, so a repeated click can only
  // re-mail the confirmer themselves; harmless.
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
    if (!sent.ok) console.warn("[confirm] result email failed:", sent.error);
    delivered = sent.ok;
  } else {
    console.warn("[confirm] result email skipped: send circuit open");
  }

  if (delivered) {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: verified.email,
      event: "email_subscription_confirmed",
      properties: { saint_slug: saint.slug },
    });
    posthog.identify({
      distinctId: verified.email,
      properties: { $email: verified.email },
    });
    await posthog.flush();
  }

  // Only claim delivery when the email actually dispatched. On a skip or failure
  // the confirm token is still valid (7-day TTL), so the "pending" page invites a
  // re-click rather than falsely promising an email that never left.
  return seeOther(
    delivered ? "/subscribed?status=ok" : "/subscribed?status=pending"
  );
}
