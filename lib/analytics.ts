// The beforeInteractive bootstrap queues calls until Google's script loads.
type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    "ga-disable-G-C75CMC27YN"?: boolean;
  }
}

export function track(event: string, params?: EventParams): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!['www.saintdiscoveryquiz.com', 'saintdiscoveryquiz.com'].includes(window.location.hostname) || !window.gtag || window["ga-disable-G-C75CMC27YN"]) return false;
    const location = new URL(window.location.href);
    if (/^\/admin(?:\/|$)/i.test(decodeURIComponent(location.pathname))) return false;
    location.searchParams.delete("token");
    window.gtag("event", event, { ...params, page_location: location.href });
    return true;
  } catch {
    return false;
  }
}

const recorded = new Set<string>();
export function trackConfirmedSubscription(receiptId: string): boolean {
  if (typeof window === "undefined" || !/^[a-f0-9-]{36}$/.test(receiptId)) return false;
  const key = `sd:confirmed-subscription:${receiptId}`;
  if (recorded.has(key)) return false;
  try { if (window.localStorage.getItem(key)) return false; } catch { /* memory fallback */ }
  if (!track("generate_lead", { method: "email_confirm" })) return false;
  recorded.add(key);
  try { window.localStorage.setItem(key, "1"); } catch { /* memory fallback */ }
  return true;
}
