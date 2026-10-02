import commemorations from "@/lib/data/saint-calendar-commemorations.json";
import { validDateKey } from "@/lib/calendar-date";
import type { Saint } from "@/lib/types";

export interface SaintCommemoration {
  slug: string;
  note: string;
  scope: string;
  reviewed_on: string;
  sources: { title: string; url: string }[];
}

const CALENDAR = commemorations as Record<string, SaintCommemoration[]>;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function getSaintCommemoration(slug: string, date: string): SaintCommemoration | null {
  if (!validDateKey(date)) return null;
  return CALENDAR[date]?.find(entry => entry.slug === slug) ?? null;
}

// A person can have several documented commemorations: a national or religious
// calendar, a Martyrology date, or an additional celebration such as Joseph the
// Worker. Preserve the biography's main date and use the same lookup everywhere.
export function saintHasCalendarDate(saint: Saint, date: string): boolean {
  if (!validDateKey(date) || saint.kind !== "saint") return false;
  const [month, day] = date.split("-").map(Number);
  const label = `${MONTHS[month - 1]} ${day}`;
  return saint.feast_day === label || getSaintCommemoration(saint.slug, date) !== null;
}
