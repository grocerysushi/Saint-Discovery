import batch1 from "@/lib/data/saint-contributions-1.json";
import batch2 from "@/lib/data/saint-contributions-2.json";
import batch3 from "@/lib/data/saint-contributions-3.json";
import batch4 from "@/lib/data/saint-contributions-4.json";
import { reviews } from "@/lib/saint-reviews";

export interface SaintContribution {
  title: string;
  paragraphs: string[];
  sources: { title: string; url: string }[];
  reflection: string;
  reviewed_on: string;
}

export const saintContributions: Record<string, SaintContribution> = {};
for (const batch of [batch1, batch2, batch3, batch4]) {
  for (const [slug, contribution] of Object.entries(batch)) {
    if (reviews[slug]?.status !== "source-reviewed") {
      throw new Error(`Saint contribution requires a reviewed canonical identity: ${slug}`);
    }
    if (saintContributions[slug]) throw new Error(`Duplicate saint contribution: ${slug}`);
    saintContributions[slug] = contribution as SaintContribution;
  }
}

export function getSaintContribution(slug: string): SaintContribution | undefined {
  return saintContributions[slug];
}
