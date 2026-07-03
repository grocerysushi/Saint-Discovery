import { RESEND_API_KEY, RESEND_FROM, RESEND_REPLY_TO } from "./config";

// Minimal Resend REST client (no SDK dependency). Notes baked in from the API:
// - success body is a bare { id } (NOT { data: { id } } — that's an SDK wrapper)
// - reply_to is snake_case over REST
// - fetch does not throw on 4xx/5xx, so we check res.ok and read the error body
// - error body shape: { statusCode, name, message }

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** https endpoint that accepts an unauthenticated one-click POST (RFC 8058). */
  listUnsubscribeUrl?: string;
  /** mailto fallback for List-Unsubscribe. */
  listUnsubscribeMailto?: string;
}

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendResult> {
  if (!RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not configured" };

  const body: Record<string, unknown> = {
    from: RESEND_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  };
  if (RESEND_REPLY_TO) body.reply_to = RESEND_REPLY_TO;

  if (input.listUnsubscribeUrl || input.listUnsubscribeMailto) {
    const parts: string[] = [];
    if (input.listUnsubscribeUrl) parts.push(`<${input.listUnsubscribeUrl}>`);
    if (input.listUnsubscribeMailto)
      parts.push(`<mailto:${input.listUnsubscribeMailto}>`);
    body.headers = {
      "List-Unsubscribe": parts.join(", "),
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "SaintDiscovery/1.0 (+https://www.saintdiscoveryquiz.com)",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      name?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: json.message || json.name || `HTTP ${res.status}`,
      };
    }
    // A 2xx with no id means the send didn't really happen — treat as a failure
    // so it surfaces in the caller's warn logs rather than a fabricated success.
    if (!json.id) {
      return { ok: false, error: json.message || "Resend 2xx with no message id" };
    }
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}
