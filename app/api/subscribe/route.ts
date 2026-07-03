import { NextResponse, type NextRequest } from "next/server";
import { getSaintBySlug } from "@/lib/saints";
import { normalizeEmail } from "@/lib/emails/validation";
import { createToken } from "@/lib/emails/tokens";
import { buildConfirmEmail } from "@/lib/emails/render";
import { sendEmail } from "@/lib/emails/resend";
import { emailLinkOrigin } from "@/lib/emails/config";
import {
  allowByIp,
  allowByEmail,
  circuitAllows,
  clientIp,
} from "@/lib/emails/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same generic response for every outcome (new, already-subscribed, honeypot,
// cooldown, invalid) so the endpoint leaks nothing and can't be used to probe
// whether an address is on the list. It also writes NOTHING to the DB — a row is
// only created after the recipient confirms.
const GENERIC = {
  ok: true,
  message: "Almost there — check your inbox for a confirmation link.",
};
const CONFIRM_TTL = 60 * 60 * 24 * 7; // 7 days

function generic() {
  return NextResponse.json(GENERIC, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
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
    return generic();
  }
  if (raw.length > 4096) return generic(); // reject oversized bodies pre-parse

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return generic();
  }

  // Honeypot: any non-empty decoy field => silently drop (never tell the bot).
  const hp = data.company ?? data.website ?? data.hp;
  if (typeof hp === "string" && hp.trim().length > 0) return generic();

  const email = normalizeEmail(data.email);
  if (!email) return generic();

  const slug = typeof data.saintSlug === "string" ? data.saintSlug : "";
  const saint = await getSaintBySlug(slug);
  if (!saint) return generic(); // never trust the client slug; must be known

  // Best-effort abuse controls.
  if (!allowByIp(clientIp(request))) return generic();
  if (!allowByEmail(email)) return generic();
  if (!circuitAllows()) return generic();

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

  // Fire the confirmation email; the response is generic regardless of outcome.
  const sent = await sendEmail({ to: email, subject, html, text });
  if (!sent.ok) console.warn("[subscribe] confirmation email failed:", sent.error);

  return generic();
}
