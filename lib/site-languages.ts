export const SITE_ORIGIN = "https://www.saintdiscoveryquiz.com";
export const TRANSLATED_HOST = "www-saintdiscoveryquiz-com.translate.goog";

// Order informed by GA4's production-reader Language report, Sep 14–Oct 11, 2026.
// French precedes Chinese because engagement is markedly stronger at equal volume.
export const SITE_LANGUAGES = [
  { code: "es", name: "Español", english: "Spanish" },
  { code: "de", name: "Deutsch", english: "German" },
  { code: "fr", name: "Français", english: "French" },
  { code: "it", name: "Italiano", english: "Italian" },
  { code: "zh-CN", name: "简体中文", english: "Chinese (Simplified)" },
  { code: "zh-TW", name: "繁體中文", english: "Chinese (Traditional)" },
  { code: "sv", name: "Svenska", english: "Swedish" },
  { code: "pt", name: "Português", english: "Portuguese" },
  { code: "nl", name: "Nederlands", english: "Dutch" },
  { code: "pl", name: "Polski", english: "Polish" },
  { code: "hu", name: "Magyar", english: "Hungarian" },
  { code: "hr", name: "Hrvatski", english: "Croatian" },
  { code: "cs", name: "Čeština", english: "Czech" },
  { code: "fi", name: "Suomi", english: "Finnish" },
  { code: "id", name: "Bahasa Indonesia", english: "Indonesian" },
  { code: "ja", name: "日本語", english: "Japanese" },
  { code: "sl", name: "Slovenščina", english: "Slovenian" },
  { code: "da", name: "Dansk", english: "Danish" },
  { code: "ko", name: "한국어", english: "Korean" },
  { code: "ar", name: "العربية", english: "Arabic" },
  { code: "no", name: "Norsk", english: "Norwegian" },
  { code: "ro", name: "Română", english: "Romanian" },
  { code: "ru", name: "Русский", english: "Russian" },
  { code: "sk", name: "Slovenčina", english: "Slovak" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese" },
  { code: "lt", name: "Lietuvių", english: "Lithuanian" },
  { code: "hy", name: "Հայերեն", english: "Armenian" },
  { code: "ca", name: "Català", english: "Catalan" },
  { code: "el", name: "Ελληνικά", english: "Greek" },
  { code: "mt", name: "Malti", english: "Maltese" },
  { code: "cy", name: "Cymraeg", english: "Welsh" },
  { code: "tl", name: "Filipino", english: "Filipino" },
] as const;

const PUBLIC_PAGES = new Set([
  "/", "/quiz", "/resources", "/resources/teachers", "/resources/reading",
  "/saint-of-day", "/patron-saint-of", "/confirmation-saint-guide", "/blog",
  "/about", "/privacy", "/editorial-policy", "/editorial-policy/corrections",
  "/editorial-policy/feast-calendars",
]);

export function isTranslationProxy(hostname: string): boolean {
  return hostname === TRANSLATED_HOST;
}

export function isSupportedLanguage(code: string): boolean {
  return SITE_LANGUAGES.some(language => language.code === code);
}

// Only public reading/quiz routes can leave the site for translation. Never
// forward arbitrary query strings, fragments, confirmation tokens or redirects.
export function publicTranslationUrl(path: string): URL | null {
  try {
    const parsed = new URL(path, SITE_ORIGIN);
    if (![SITE_ORIGIN, `https://${TRANSLATED_HOST}`].includes(parsed.origin)) return null;
    const pathname = parsed.pathname.replace(/\/$/, "") || "/";
    if (!PUBLIC_PAGES.has(pathname) && !/^\/(?:saints|patron-saint-of|blog|quiz\/results)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) return null;
    return new URL(pathname, SITE_ORIGIN);
  } catch {
    return null;
  }
}

export function translatedPageUrl(path: string, language: string): string | null {
  const page = publicTranslationUrl(path);
  if (!page) return null;
  if (language === "en") return page.href;
  if (!isSupportedLanguage(language)) return null;
  const url = new URL("https://translate.google.com/translate");
  url.search = new URLSearchParams({ sl: "en", tl: language, u: page.href }).toString();
  return url.href;
}

// Preserve the translation parameters through Next.js links. Native document
// navigation lets Google's proxy translate the destination and its metadata.
export function proxyNavigationUrl(path: string, language: string): string | null {
  const page = publicTranslationUrl(path);
  if (!page || !isSupportedLanguage(language)) return null;
  const source = new URL(path, SITE_ORIGIN);
  const allowed = page.pathname === "/resources"
    ? ["q", "gender", "month", "country", "vocation", "order", "status", "page"]
    : page.pathname === "/blog" ? ["q", "category", "page"] : [];
  for (const key of allowed) {
    const value = source.searchParams.get(key);
    if (value) page.searchParams.set(key, value.slice(0, 160));
  }
  page.hostname = TRANSLATED_HOST;
  page.searchParams.set("_x_tr_sl", "en");
  page.searchParams.set("_x_tr_tl", language);
  page.searchParams.set("_x_tr_hl", language);
  return page.href;
}
