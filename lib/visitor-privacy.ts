// Automatic GA4 on public production pages, with persistent visitor exclusions.
export const PRIVACY_KEY = "sd:privacy:v1";
export const PRIVACY_DAYS = 180;
export type PrivacyChoice = { version: 1; analytics: boolean; classroom: boolean; expires: number };
export function readPrivacyChoice(raw: string | null, now = Date.now()): PrivacyChoice | null {
  try {
    const value = JSON.parse(raw || "null");
    if (value?.version !== 1 || typeof value.analytics !== "boolean" || typeof value.classroom !== "boolean" ||
        !Number.isFinite(value.expires) || value.expires <= now || value.expires > now + PRIVACY_DAYS * 86400000) return null;
    return { ...value, analytics: value.analytics && !value.classroom };
  } catch { return null; }
}
export function analyticsAllowed(): boolean {
  try {
    const browser = window.navigator as (Navigator & { globalPrivacyControl?: boolean }) | undefined;
    if (browser?.globalPrivacyControl === true || browser?.doNotTrack === "1") return false;
    const raw = window.localStorage.getItem(PRIVACY_KEY);
    if (raw === null || raw === undefined) return true;
    const choice = JSON.parse(raw);
    if (choice === null) return true;
    // Never expire a refusal or classroom setting back into tracking.
    return choice?.version === 1 && choice.analytics === true && choice.classroom === false;
  }
  catch { return false; }
}
export function classroomMode(): boolean {
  // A shared-device safeguard must not silently expire back into email forms.
  try { return JSON.parse(window.localStorage.getItem(PRIVACY_KEY) || "null")?.classroom === true; }
  catch { return true; }
}
export function clearAnalyticsCookies() {
  for (const part of document.cookie.split(";")) {
    const name = part.trim().split("=")[0];
    if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const domain of ["", location.hostname, ".saintdiscoveryquiz.com"]) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
