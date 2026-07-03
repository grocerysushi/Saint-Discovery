// HTML-escape every value interpolated into an HTML email or page. Ampersand
// first so we don't double-escape the entities we introduce.
export function escapeHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Normalize + validate a single email address. Returns the normalized address or
// null. Rejects control chars (CR/LF), multiple addresses, and over-length input
// before doing anything else.
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length === 0 || raw.length > 254) return null;
  if (/[\r\n]/.test(raw)) return null;

  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  // No whitespace / comma / semicolon => blocks multiple-address injection.
  if (/[\s,;]/.test(email)) return null;
  // Reject C0/C1 control chars, DEL, and HTML metacharacters that the loose shape
  // check below would otherwise admit (e.g. "a<b>@x.co", NUL/BEL/ESC bytes).
  if (/[\x00-\x1f\x7f-\x9f<>"'`]/.test(email)) return null;
  // Conservative single-address shape. Perfection isn't the goal; rejecting
  // control chars and multi-address is.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}
