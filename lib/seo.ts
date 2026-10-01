import type { Metadata } from "next";

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

// Next.js replaces nested Open Graph/Twitter objects rather than merging them.
// Supply the full sharing card on every page that overrides those fields.
export function socialMetadata(title: string, description: string, path: string, type: "website" | "article" = "website"): Pick<Metadata, "openGraph" | "twitter"> {
  const image = { url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: "Saint Discovery — Catholic saints, prayer and faith" };
  return {
    openGraph: { title, description, url: absoluteUrl(path), siteName: siteConfig.name, locale: siteConfig.locale, type, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}
