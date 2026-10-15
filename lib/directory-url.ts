import { EMPTY_FILTERS, type DirectoryFilters } from "./directory-shared";

export function readDirectoryQuery(query: string): DirectoryFilters {
  const params = new URLSearchParams(query);
  return Object.fromEntries(Object.keys(EMPTY_FILTERS).map(key => [key,
    params.get(key === "search" ? "q" : key) ?? "",
  ])) as unknown as DirectoryFilters;
}

export function directoryQuery(filters: DirectoryFilters, page = 1): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(EMPTY_FILTERS) as (keyof DirectoryFilters)[]) {
    const value = filters[key].trim().slice(0, 100);
    if (value) params.set(key === "search" ? "q" : key, value);
  }
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export function directoryUrl(filters: DirectoryFilters, page = 1): string {
  const query = directoryQuery(filters, page);
  return `/resources${query ? `?${query}` : ""}`;
}
