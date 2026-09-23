import { NextResponse, type NextRequest } from "next/server";
import { getSaintBySlug } from "@/lib/saints";
import { normalizeEmail } from "@/lib/emails/validation";
import { createToken } from "@/lib/emails/tokens";
import { buildConfirmEmail } from "@/lib/emails/render";
import { sendEmail } from "@/lib/emails/resend";
import { emailLinkOrigin } from "@/lib/emails/config";
import {
  allowByIp,
  reserveEmailSend,
  circuitAllows,
  clientIp,
} from "@/lib/emails/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Never look up subscription membership here. Existing and new subscribers
// receive the same response; validation and service errors can still be honest.
const GENERIC = {
  ok: true,
  status: "accepted",
  retryAfter: 60,
  message: "Check your inbox for a confirmation link.",
};
const CONFIRM_TTL = 60 * 60 * 24 * 7; // 7 days

function generic() {
  return NextResponse.json(GENERIC, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}

function failure(status: number, message: string, retryAfter = 0) {
  return NextResponse.json({ ok: false, message, retryAfter }, {
    status, headers: { "Cache-Control": "no-store", ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}) },
  });
}

export async function POST(request: NextRequest) {
  const ctype = request.headers.get("content-type") ?? "";
  if (!ctype.includes("application/json")) {
    return NextResponse.json(
      { ok: false, message: "Unsupported content type." },
      { status: 415 }
    );
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return failure(400, "Please check your email address and try again.");
  }
  if (raw.length > 4096) return failure(413, "Please check your email address and try again.");

  let data: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return failure(400, "Please check your email address and try again.");
    data = parsed;
  } catch {
    return failure(400, "Please check your email address and try again.");
  }

  // Honeypot: any non-empty decoy field => silently drop (never tell the bot).
  const hp = data.company ?? data.website ?? data.hp;
  if (typeof hp === "string" && hp.trim().length > 0) return generic();

  const email = normalizeEmail(data.email);
  if (!email) return failure(400, "Enter a valid email address.");

  const slug = typeof data.saintSlug === "string" ? data.saintSlug : "";
  const saint = await getSaintBySlug(slug);
  if (!saint || saint.kind === "unresolved") return failure(400, "Please return to your quiz result and try again.");

  // Best-effort abuse controls.
  if (!allowByIp(clientIp(request))) return failure(429, "Too many requests. Please wait before trying again.", 720);
  const reservation = reserveEmailSend(email);
  if (!reservation.allowed) return failure(429, "A confirmation was requested recently. Check your inbox, or wait to resend.", reservation.retryAfter);
  if (!circuitAllows()) return failure(503, "Email is temporarily unavailable. Please try again shortly.", 60);

  try {
    const token = createToken({
      email,
      slug: saint.slug,
      purpose: "confirm",
      ttlSeconds: CONFIRM_TTL,
    });
    const origin = emailLinkOrigin();
    const confirmUrl = `${origin}/confirm?token=${encodeURIComponent(token)}`;

    const { subject, html, text } = buildConfirmEmail({
      confirmUrl,
      siteUrl: origin,
    });

    // Accepted by Resend does not mean delivered to the recipient's inbox.
    const sent = await sendEmail({ to: email, subject, html, text });
    if (!sent.ok) {
      console.warn("[subscribe] confirmation_send_failed", { code: sent.code });
      return failure(503, "We couldn't send the confirmation email. Please try again in a minute.", 60);
    }
    console.info("[subscribe] confirmation_send_accepted", { messageId: sent.id });

    return generic();
  } catch {
    console.warn("[subscribe] confirmation_send_failed");
    return failure(503, "We couldn't send the confirmation email. Please try again in a minute.", 60);
  }
}
