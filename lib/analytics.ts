// Thin GA4 event helper. gtag.js is loaded in app/layout.tsx; this no-ops when
// it hasn't loaded (blocked, SSR, dev without network) — analytics must never
// break the app.
type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
  } catch {
    // ignore
  }
}
