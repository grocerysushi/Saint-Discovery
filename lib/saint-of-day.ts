import { localDateKey, validDateKey } from "./calendar-date";
import saints from "@/lib/data/saints.json";
import images from "@/lib/data/saint-images.json";
import generatedImages from "@/lib/data/saint-generated-images.json";

export interface DailySaint {
  date: string;
  name: string;
  slug: string;
  feastDay: string;
  image: { src: string; alt: string; credit: string; license: string; source: string; generated?: boolean } | null;
}

// Prefer an illustrated saint when several share a feast day. Never substitute
// a saint with a different feast date just to fill the artwork space.
export function getSaintOfDay(date = localDateKey()): DailySaint | null {
  if (!validDateKey(date)) return null;
  const [month, day] = date.split("-").map(Number);
  const feastDay = new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const matches = saints.filter(s => s.feast_day === feastDay);
  // Historical artwork always takes precedence over a generated illustration.
  // Keep generated assets separate so refreshing Wikimedia metadata cannot erase them.
  const historical = images as Record<string, DailySaint["image"]>;
  const generated = generatedImages as Record<string, DailySaint["image"]>;
  const saint = matches.find(s => historical[s.slug])
    ?? matches.find(s => generated[s.slug])
    ?? matches[0];
  if (!saint) return null;
  return { date, name: saint.name, slug: saint.slug, feastDay, image: historical[saint.slug] ?? generated[saint.slug] ?? null };
}
