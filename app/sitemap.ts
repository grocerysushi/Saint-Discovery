import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";
import { PATRON_TOPICS } from "@/lib/patronage";

export const revalidate = 86400;

// Bump when site content meaningfully changes. A stable date keeps lastmod
// honest — stamping every URL with build time teaches Google to ignore it.
const CONTENT_UPDATED = new Date("2026-07-13");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = CONTENT_UPDATED;

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/resources"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/patron-saint-of"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  let saintEntries: MetadataRoute.Sitemap = [];
  try {
    const saints = await getAllSaints();
    saintEntries = saints
      .filter((s) => s.slug)
      .map((s) => ({
        url: absoluteUrl(`/saints/${s.slug}`),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
  } catch {
    // If saint data is unavailable at build time, fall back to static entries.
  }

  const patronEntries: MetadataRoute.Sitemap = PATRON_TOPICS.map((t) => ({
    url: absoluteUrl(`/patron-saint-of/${t.slug}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticEntries, ...saintEntries, ...patronEntries];
}
