import { type NextRequest, NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { verifyToken } from "@/lib/emails/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unsubscribing is safe to over-trigger (RFC 8058 one-click is itself a POST from
// the mail provider), so — unlike confirm — we act directly on POST. Two callers:
//   1. Mail-provider one-click: POST with token in the query string.
//   2. The human /unsubscribe page's button: POST with token in the form body.
async function readToken(request: NextRequest): Promise<string> {
  const q = request.nextUrl.searchParams.get("token");
  if (q) return q;
  try {
    const form = await request.formData();
    return String(form.get("token") ?? "");
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  const token = await readToken(request);
  const verified = verifyToken(token, "unsub");
  let ok = false;
  if (verified) {
    try {
      // postgrest-js resolves with { data, error }; only a missing error means
      // the row was actually removed.
      const { error: delErr } = await insforge.database
        .from("email_signups")
        .delete()
        .eq("email", verified.email);
      ok = !delErr;
    } catch {
      ok = false;
    }
  }

  // A browser form submit expects HTML -> redirect to a friendly page. A mail
  // provider's one-click POST just wants a 200.
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    return new NextResponse(null, {
      status: 303,
      headers: {
        // Only claim success when the delete truly succeeded; otherwise fall back
        // to the neutral "request received" copy.
        Location: ok ? "/unsubscribed?status=ok" : "/unsubscribed",
        "Cache-Control": "no-store",
      },
    });
  }
  // One-click: 200 when done or when there's nothing to do (invalid token);
  // 500 only when a valid unsubscribe actually failed to persist.
  return new NextResponse(null, { status: verified && !ok ? 500 : 200 });
}

// A stray GET on the API URL (e.g. a scanner) shouldn't act; send humans to the
// confirmation page instead.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/unsubscribe${token ? `?token=${encodeURIComponent(token)}` : ""}`,
      "Cache-Control": "no-store",
    },
  });
}
