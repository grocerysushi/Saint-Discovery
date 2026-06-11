import { insforge } from "@/lib/insforge";
import { Saint } from "@/lib/types";

export async function getAllSaints(): Promise<Saint[]> {
  const res = await insforge.database
    .from("saints")
    .select()
    .order("name", { ascending: true });
  return (res.data || []) as Saint[];
}

export async function getSaintBySlug(slug: string): Promise<Saint | null> {
  const res = await insforge.database
    .from("saints")
    .select()
    .eq("slug", slug)
    .limit(1);
  const rows = (res.data || []) as Saint[];
  return rows[0] ?? null;
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
