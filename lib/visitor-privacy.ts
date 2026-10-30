// A local preference, not an identity. Analytics requires explicit opt-in.
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
  try { return readPrivacyChoice(window.localStorage.getItem(PRIVACY_KEY))?.analytics === true; }
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
