import type { Saint } from "./types";
import { directoryOptions, getDirectoryEntry, matchesDirectoryFilters, normalizeDirectorySearch } from "./directory-filters";
import { EMPTY_FILTERS, type DirectoryDailyCard, type DirectoryFilters } from "./directory-shared";
import { saintHasCalendarDate } from "./saint-calendar";

export const DIRECTORY_PAGE_SIZE = 36;
export type DirectorySearchParams = Record<string, string | string[] | undefined>;

// Names and editorial aliases come before incidental mentions in a biography.
// Keep alphabetical ordering within each tier and for unfiltered browsing.
export function directoryNameRank(saint: Saint, search: string): number {
  const normalizeName = (value: string) => normalizeDirectorySearch(value).replace(/^(?:st\.?|saint)\s+/, "");
  const query = normalizeName(search);
  if (!query) return 0;
  const names = [saint.name, ...(saint.alternate_names ?? [])].map(normalizeName);
  if (names.some(name => name === query)) return 0;
  if (names.some(name => name.startsWith(`${query} `))) return 1;
  if (names.some(name => (` ${name} `).includes(` ${query} `))) return 2;
  if (names.some(name => name.includes(query))) return 3;
  return 4;
}

export function getDirectoryPage(saints: Saint[], params: DirectorySearchParams) {
  const rawPage = params.page ?? "1";
  const validPage = typeof rawPage === "string" && /^[1-9][0-9]*$/.test(rawPage) && Number(rawPage) <= 100000;
  const page = validPage ? Number(rawPage) : 1;
  const filters = Object.fromEntries(Object.keys(EMPTY_FILTERS).map(key => {
    const raw = params[key === "search" ? "q" : key];
    const value = typeof raw === "string" ? raw : raw?.[0] ?? "";
    return [key, value.trim().slice(0, 100)];
  })) as unknown as DirectoryFilters;
  const entries = saints.map(saint => ({ saint, facets: getDirectoryEntry(saint) }));
  const facets = entries.map(entry => entry.facets);
  const options = { country: directoryOptions(facets, "countries"), vocation: directoryOptions(facets, "vocations"), order: directoryOptions(facets, "orders") };
  const matches = entries.filter(({ saint, facets }) => matchesDirectoryFilters(saint, facets, filters))
    .sort((a, b) => directoryNameRank(a.saint, filters.search) - directoryNameRank(b.saint, filters.search)
      || a.saint.name.localeCompare(b.saint.name, "en") || a.saint.slug.localeCompare(b.saint.slug, "en"));
  const total = matches.length;
  const pages = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const offset = (page - 1) * DIRECTORY_PAGE_SIZE;
  return { filters, options, page, pages, total, catalogueTotal: saints.length, offset,
    validPage: validPage && page <= pages,
    saints: matches.slice(offset, offset + DIRECTORY_PAGE_SIZE).map(entry => entry.saint) };
}

export function getDirectoryDailyCards(saints: Saint[], date: string): DirectoryDailyCard[] {
  return saints.filter(saint => saintHasCalendarDate(saint, date)).map(({ slug, name, kind, tagline, description }) => ({ slug, name, kind, tagline, description }));
}
