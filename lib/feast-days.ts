// Month-by-month feast calendar built from the feast day each published
// biography already shows. Dates follow that biography; calendars can differ
// (see /editorial-policy/feast-calendars).

export const FEAST_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((name, index) => ({ name, slug: name.toLowerCase(), number: index + 1 }));

export type FeastMonth = (typeof FEAST_MONTHS)[number];

const FEAST_DAY = /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2})$/;

export function parseFeastDay(value?: string | null): { month: FeastMonth; day: number } | null {
  const match = value ? FEAST_DAY.exec(value.trim()) : null;
  if (!match) return null;
  const month = FEAST_MONTHS.find(entry => entry.name === match[1])!;
  const day = Number(match[2]);
  // Days in a leap year, so February 29 stays valid.
  const days = new Date(Date.UTC(2024, month.number, 0)).getUTCDate();
  return day >= 1 && day <= days ? { month, day } : null;
}

export function getFeastMonth(slug: string): FeastMonth | null {
  return FEAST_MONTHS.find(month => month.slug === slug) ?? null;
}

export function feastDayAnchor(month: FeastMonth, day: number) {
  return `${month.slug}-${day}`;
}

/** Link to a saint's date on its month page, or null when the feast day is not a calendar date. */
export function feastDayHref(value?: string | null): string | null {
  const parsed = parseFeastDay(value);
  return parsed ? `/feast-days/${parsed.month.slug}#${feastDayAnchor(parsed.month, parsed.day)}` : null;
}

export interface FeastDayGroup<T> {
  day: number;
  label: string;
  anchor: string;
  saints: T[];
}

/** Saints with a feast in the given month, grouped by day and sorted by day then name. */
export function feastDaysInMonth<T extends { name: string; feast_day?: string | null }>(saints: T[], month: FeastMonth): FeastDayGroup<T>[] {
  const byDay = new Map<number, T[]>();
  for (const saint of saints) {
    const parsed = parseFeastDay(saint.feast_day);
    if (parsed?.month.slug !== month.slug) continue;
    byDay.set(parsed.day, [...(byDay.get(parsed.day) ?? []), saint]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, group]) => ({
      day,
      label: `${month.name} ${day}`,
      anchor: feastDayAnchor(month, day),
      saints: group.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
