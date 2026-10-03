import { localDateKey, validDateKey } from "./calendar-date";
import saints from "@/lib/data/saints.json";
import directoryAdditions from "@/lib/data/directory-additions.json";
import { applySaintReview, canonicalSaintSlug, isPublishedSaintSlug } from "@/lib/saint-reviews";
import type { Saint } from "@/lib/types";
import { getSaintCommemoration, saintHasCalendarDate } from "@/lib/saint-calendar";
import { getSaintArtwork, saintArtworkPriority, type SaintArtwork } from "@/lib/saint-artwork";
import { getUSSaintPriority } from "@/lib/us-saint-calendar";

export interface DailySaint {
  date: string;
  name: string;
  kind?: Saint["kind"];
  slug: string;
  feastDay: string;
  calendarNote?: string;
  calendarSources?: { title: string; url: string }[];
  image: SaintArtwork;
}

// Prefer U.S. calendar saints before artwork availability. Artwork breaks ties
// only within equal calendar priority; never borrow an unrelated feast date.
export function getSaintOfDay(date = localDateKey()): DailySaint | null {
  if (!validDateKey(date)) return null;
  const [month, day] = date.split("-").map(Number);
  const feastDay = new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const matches = ([...saints, ...directoryAdditions.map(entry => entry.saint)] as Saint[])
    .filter(s => canonicalSaintSlug(s.slug) === s.slug && isPublishedSaintSlug(s.slug))
    .map(applySaintReview)
    .filter(s => saintHasCalendarDate(s, date));
  const saint = matches.sort((a, b) => getUSSaintPriority(b.slug, date) - getUSSaintPriority(a.slug, date)
    || saintArtworkPriority(b.slug) - saintArtworkPriority(a.slug))[0];
  if (!saint) return null;
  const commemoration = getSaintCommemoration(saint.slug, date);
  return { date, name: saint.name, kind: saint.kind, slug: saint.slug, feastDay,
    calendarNote: commemoration?.note,
    calendarSources: commemoration?.sources,
    image: getSaintArtwork(saint) };
}
