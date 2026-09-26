import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";
import { PATRON_TOPICS } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";
import { getBiographyReview } from "@/lib/saint-reviews";

export const revalidate = 86400;

// Bump when site content meaningfully changes. A stable date keeps lastmod
// honest — stamping every URL with build time teaches Google to ignore it.
const CONTENT_UPDATED = new Date("2026-09-08");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = CONTENT_UPDATED;

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/saint-of-day"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/confirmation-saint-guide"),
      lastModified: new Date("2026-09-23"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/resources"),
      lastModified: new Date("2026-09-23"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/resources/teachers"),
      lastModified: new Date("2026-09-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/patron-saint-of"),
      lastModified: new Date("2026-09-16"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date("2026-09-25"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date("2026-09-25"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/editorial-policy"),
      lastModified: new Date("2026-09-25"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Data is bundled locally: fail visibly if it cannot load instead of
  // silently publishing a sitemap with every saint biography missing.
  const saints = await getAllSaints();
  const saintEntries: MetadataRoute.Sitemap = saints
    .filter((s) => s.slug)
    .map((s) => ({
      url: absoluteUrl(`/saints/${s.slug}`),
      lastModified: new Date(getBiographyReview(s.slug)?.reviewed_on ?? CONTENT_UPDATED),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const guideSlugs = new Set(PATRON_GUIDES.map(guide => guide.slug));
  const patronEntries: MetadataRoute.Sitemap = PATRON_TOPICS.filter(t => !guideSlugs.has(t.slug)).map((t) => ({
    url: absoluteUrl(`/patron-saint-of/${t.slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const guideEntries: MetadataRoute.Sitemap = PATRON_GUIDES.map(guide => ({
    url: absoluteUrl(`/patron-saint-of/${guide.slug}`),
    lastModified: new Date(guide.reviewedOn),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...saintEntries, ...patronEntries, ...guideEntries];
}
