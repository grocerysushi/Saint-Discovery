import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

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
    // If the DB is unreachable at build time, fall back to the static entries.
  }

  return [...staticEntries, ...saintEntries];
}
