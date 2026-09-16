import metadata from "@/lib/data/saint-directory-metadata.json";
import type { Saint } from "@/lib/types";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const UNCLASSIFIED = "__unclassified";
export const STATUS_LABELS: Record<string, string> = {
  saint: "Saint", blessed: "Blessed", "orthodox-saint": "Orthodox saint", observance: "Liturgical observance",
};
export interface DirectoryMetadata { vocations: string[]; orders: string[] }
export interface DirectoryEntry extends DirectoryMetadata { countries: string[]; month: string; status: string }
export interface DirectoryFilters { search: string; gender: string; month: string; country: string; vocation: string; order: string; status: string }
export const EMPTY_FILTERS: DirectoryFilters = { search: "", gender: "", month: "", country: "", vocation: "", order: "", status: "" };

// The JSON is a manually curated index of the reviewed biographies and their
// linked sources, keyed only by canonical slug. Categories can overlap across
// a life (for example parenthood followed by religious life). Empty arrays mean
// unclassified, never "no order". Do not generate membership from keyword hits:
// biographies also mention relatives, teachers, and orders a person did not join.

// Geographic associations from the reviewed origin field, not modern nationality.
// Historical regions are kept as regions rather than assigned to current borders.
const GEOGRAPHY: [string, RegExp][] = [
  ...["Albania", "Armenia", "Australia", "Austria", "Belgium", "Brazil", "Bulgaria", "Canada", "Chile", "China", "Colombia", "Cuba", "Czech Republic", "Denmark", "Ecuador", "Egypt", "El Salvador", "England", "Ethiopia", "France", "Germany", "Greece", "Guatemala", "Hungary", "India", "Ireland", "Italy", "Japan", "Korea", "Lebanon", "Lithuania", "Mexico", "Montenegro", "Netherlands", "Norway", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Russia", "Scotland", "Serbia", "Spain", "Sudan", "Sweden", "Switzerland", "Syria", "Tunisia", "Uganda", "Ukraine", "United States", "Vietnam", "Wales"].map(name => [name, new RegExp(`\\b${name}\\b`, "i")] as [string, RegExp]),
  ["Democratic Republic of the Congo", /\bDemocratic Republic of the Congo\b/i],
  ["Türkiye", /\b(?:Turkey|Türkiye)\b/i],
  ["Holy Land (historical region)", /\b(?:Holy Land|Judea|Galilee|Jerusalem|Mount Carmel|Samaria|Ancient Israel)\b/i],
  ["Asia Minor (historical region)", /\b(?:Asia Minor|Cappadocia|Pontus|Bithynia|Cilicia|Nicomedia)\b/i],
  ["North Africa (historical region)", /\bNorth Africa\b/i],
  ["Mesopotamia (historical region)", /\b(?:Mesopotamia|Edessa)\b/i],
  ["Persia (historical region)", /\bPersia\b/i],
  ["Rus’ (historical region)", /\b(?:Kyivan Rus|Medieval Rus)/i],
  ["Britain (historical region)", /\bBritain\b/i],
  ["Gaul (historical region)", /\bGaul\b/i],
  ["Bohemia (historical region)", /\bBohemia\b/i],
  ["Rome", /\bRome\b/i],
];

export function getDirectoryEntry(saint: Saint): DirectoryEntry {
  const curated = (metadata as Record<string, DirectoryMetadata>)[saint.slug];
  return {
    countries: GEOGRAPHY.filter(([, pattern]) => pattern.test(saint.origin ?? "")).map(([label]) => label),
    vocations: curated?.vocations ?? [],
    orders: curated?.orders ?? [],
    month: MONTHS.find(month => saint.feast_day?.startsWith(`${month} `)) ?? "",
    status: saint.kind ?? "",
  };
}

export function matchesDirectoryFilters(saint: Saint, entry: DirectoryEntry, filters: DirectoryFilters): boolean {
  const matches = (selected: string, values: string[]) => !selected || (selected === UNCLASSIFIED ? values.length === 0 : values.includes(selected));
  const query = filters.search.toLocaleLowerCase().trim();
  return (!filters.gender || saint.gender === filters.gender)
    && matches(filters.month, entry.month ? [entry.month] : [])
    && matches(filters.country, entry.countries)
    && matches(filters.vocation, entry.vocations)
    && matches(filters.order, entry.orders)
    && matches(filters.status, entry.status ? [entry.status] : [])
    && (!query || [saint.name, saint.tagline, saint.feast_day, saint.description, saint.origin, saint.patron_of, ...entry.vocations, ...entry.orders]
      .some(value => value?.toLocaleLowerCase().includes(query)));
}

export function directoryOptions(entries: DirectoryEntry[], key: "countries" | "vocations" | "orders"): string[] {
  return Array.from(new Set(entries.flatMap(entry => entry[key]))).sort((a, b) => a.localeCompare(b));
}
