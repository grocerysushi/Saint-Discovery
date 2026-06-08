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
