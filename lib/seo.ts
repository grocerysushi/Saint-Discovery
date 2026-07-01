const FALLBACK_SITE_URL = "https://www.saintdiscoveryquiz.com";

function normalizeSiteUrl(value?: string) {
  if (!value) {
    return FALLBACK_SITE_URL;
  }

  const normalized = value.startsWith("http") ? value : `https://${value}`;
  return normalized.replace(/\/+$/, "");
}

const envSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

export const siteConfig = {
  name: "Saint Discovery",
  title: "Which Catholic Saint Are You?",
  description:
    "Take a Catholic saint personality quiz, discover your spiritual gifts, and explore a searchable directory of saints and trusted Catholic resources.",
  url: normalizeSiteUrl(envSiteUrl),
  locale: "en_US",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
