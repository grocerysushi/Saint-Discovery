import data from "@/lib/data/us-saint-calendar.json";
import { validDateKey } from "@/lib/calendar-date";

interface USCalendarEntry { slug: string; rank: number }
const dates = data.dates as Record<string, USCalendarEntry[]>;

// Recurring U.S. sanctoral priority for a reading guide. The separate, dated
// liturgical banner handles Sundays, seasonal precedence and transferred feasts.
export function getUSSaintPriority(slug: string, date: string): number {
  if (!validDateKey(date)) return 0;
  return dates[date]?.find(entry => entry.slug === slug)?.rank ?? 0;
}

export function getUSSaintCommemoration(slug: string, date: string) {
  if (!getUSSaintPriority(slug, date)) return null;
  return {
    slug,
    note: "This saint is included on this recurring date in the U.S. Roman Rite calendar published by the USCCB. This reading guide gives U.S. calendar saints priority; the Mass celebrated on a particular year’s date can differ because of Sundays, seasons or higher-ranking celebrations.",
    scope: "U.S. Roman Rite recurring saint calendar",
    reviewed_on: data.reviewedOn,
    sources: data.sources,
  };
}
