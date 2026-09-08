const FALLBACK_SITE_URL = "https://www.saintdiscoveryquiz.com";

function normalizeSiteUrl(value?: string) {
  if (!value) {
    return FALLBACK_SITE_URL;
  }

  const normalized = value.startsWith("http") ? value : `https://${value}`;
  return normalized.replace(/\/+$/, "");
}

// Deployment hostnames are not the public canonical domain. In particular,
// VERCEL_URL changes per deployment and would split indexing signals.
const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
