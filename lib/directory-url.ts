import { EMPTY_FILTERS, type DirectoryFilters } from "./directory-filters";

export function readDirectoryQuery(query: string): DirectoryFilters {
  const params = new URLSearchParams(query);
  return Object.fromEntries(Object.keys(EMPTY_FILTERS).map(key => [key,
    params.get(key === "search" ? "q" : key) ?? "",
  ])) as unknown as DirectoryFilters;
}

export function directoryQuery(filters: DirectoryFilters): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(EMPTY_FILTERS) as (keyof DirectoryFilters)[]) {
    if (filters[key]) params.set(key === "search" ? "q" : key, filters[key]);
  }
  return params.toString();
}
