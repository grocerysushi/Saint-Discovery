import { Saint } from "@/lib/types";
import saintsData from "@/lib/data/saints.json";

// Saint content is baked into the repo (lib/data/saints.json, regenerated via
// scripts/build-data.mjs) so every page and the sitemap build statically with
// no runtime database dependency.
const SAINTS = saintsData as Saint[];

export async function getAllSaints(): Promise<Saint[]> {
  return SAINTS;
}

export async function getSaintBySlug(slug: string): Promise<Saint | null> {
  return SAINTS.find((s) => s.slug === slug) ?? null;
}

const TRAIT_COLUMNS = [
  "trait_contemplative",
  "trait_charitable",
  "trait_intellectual",
  "trait_courageous",
  "trait_joyful",
  "trait_mystical",
] as const;

export function getRelatedSaints(
  saint: Saint,
  allSaints: Saint[],
  count = 4
): Saint[] {
  return allSaints
    .filter((s) => s.slug && s.id !== saint.id)
    .map((s) => ({
      saint: s,
      distance: TRAIT_COLUMNS.reduce(
        (sum, key) => sum + (saint[key] - s[key]) ** 2,
        0
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
    .map((entry) => entry.saint);
}
