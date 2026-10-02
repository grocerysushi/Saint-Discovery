import { localDateKey, validDateKey } from "./calendar-date";
import saints from "@/lib/data/saints.json";
import directoryAdditions from "@/lib/data/directory-additions.json";
import images from "@/lib/data/saint-images.json";
import generatedImages from "@/lib/data/saint-generated-images.json";
import imageOverrides from "@/lib/data/saint-image-overrides.json";
import { applySaintReview, canonicalSaintSlug } from "@/lib/saint-reviews";
import type { Saint } from "@/lib/types";
import { getSaintCommemoration, saintHasCalendarDate } from "@/lib/saint-calendar";

export interface DailySaint {
  date: string;
  name: string;
  kind?: Saint["kind"];
  slug: string;
  feastDay: string;
  calendarNote?: string;
  calendarSources?: { title: string; url: string }[];
  image: { src: string; alt: string; credit: string; license: string; source: string; generated?: boolean } | null;
}

// Prefer an illustrated saint when several share a feast day. Never substitute
// a saint with a different feast date just to fill the artwork space.
export function getSaintOfDay(date = localDateKey()): DailySaint | null {
  if (!validDateKey(date)) return null;
  const [month, day] = date.split("-").map(Number);
  const feastDay = new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const matches = ([...saints, ...directoryAdditions.map(entry => entry.saint)] as Saint[])
    .filter(s => canonicalSaintSlug(s.slug) === s.slug)
    .map(applySaintReview)
    .filter(s => saintHasCalendarDate(s, date));
  // Historical artwork always takes precedence over a generated illustration.
  // Keep generated assets separate so refreshing Wikimedia metadata cannot erase them.
  const historical = { ...images, ...imageOverrides } as Record<string, DailySaint["image"]>;
  const generated = generatedImages as Record<string, DailySaint["image"]>;
  const saint = matches.find(s => historical[s.slug])
    ?? matches.find(s => generated[s.slug])
    ?? matches[0];
  if (!saint) return null;
  const commemoration = getSaintCommemoration(saint.slug, date);
  return { date, name: saint.name, kind: saint.kind, slug: saint.slug, feastDay,
    calendarNote: commemoration?.note,
    calendarSources: commemoration?.sources,
    image: historical[saint.slug] ?? generated[saint.slug] ?? null };
}
