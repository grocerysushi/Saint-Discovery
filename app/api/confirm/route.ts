import { type NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { getSaintBySlug } from "@/lib/saints";
import { verifyToken, createToken } from "@/lib/emails/tokens";
import { buildResultEmail } from "@/lib/emails/render";
import { sendEmail } from "@/lib/emails/resend";
import {
  emailLinkOrigin,
  EMAIL_POSTAL_ADDRESS,
  RESEND_REPLY_TO,
} from "@/lib/emails/config";
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

  // Idempotent-ish: only insert + send if this address isn't already stored, so
  // re-clicking the confirm link doesn't create duplicates or re-send the email.
  // postgrest-js resolves with { data, error } instead of throwing, so we must
  // inspect `error` explicitly: on an unknown DB state we do NOT assume "new" and
  // do NOT send (which would otherwise re-send the result email on every re-click).
  let isNew = false;
  try {
    const { data: existing, error: selErr } = await insforge.database
      .from("email_signups")
      .select("id")
      .eq("email", verified.email)
      .limit(1);
    if (!selErr) {
      isNew = !(Array.isArray(existing) && existing.length > 0);
      if (isNew) {
        const saintId =
          (saintDbIds as Record<string, string | undefined>)[saint.slug] ?? null;
        const { error: insErr } = await insforge.database
          .from("email_signups")
          .insert([{ email: verified.email, saint_id: saintId }]);
        if (insErr) isNew = false; // insert failed -> don't claim/send
      }
    }
  } catch {
    // Best-effort: never fail the user's confirmation on a backend hiccup.
    isNew = false;
  }

  if (isNew) {
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
  }

  return seeOther("/subscribed?status=ok");
}
