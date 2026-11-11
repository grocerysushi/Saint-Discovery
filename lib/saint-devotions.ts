import devotionData from "@/lib/data/saint-devotions.json";
import type { Saint, SaintDevotion } from "@/lib/types";

// Template version 2: a devotional layer kept separate from the reviewed
// biography data so it never overwrites biography, question or source text.
// Entries flagged 1.5 keep the old layout until their gaps are reviewed.
export const devotions = devotionData as Record<string, SaintDevotion>;

export function getSaintDevotion(slug: string): SaintDevotion | undefined {
  return devotions[slug];
}

export function applySaintDevotion(saint: Saint): Saint {
  const devotion = devotions[saint.slug];
  if (!devotion) return saint;
  return {
    ...saint,
    heroSummary: devotion.heroSummary,
    patronages: devotion.patronages,
    symbols: devotion.symbols,
    whyWeTurn: devotion.whyWeTurn,
    devotionQuotes: devotion.quotes,
    devotionPrayer: devotion.prayer,
    feastCustoms: devotion.feastCustoms,
    places: devotion.places,
    confirmationNote: devotion.confirmationNote,
    reflectionPrompts: devotion.reflectionPrompts,
    relatedSaints: devotion.relatedSaints,
    templateVersion: devotion.templateVersion,
    searchDescription: devotion.searchDescription,
  };
}

export function isTemplateV2(saint: Saint): boolean {
  return saint.templateVersion === 2;
}
