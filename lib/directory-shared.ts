import type { Saint } from "./types";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const UNCLASSIFIED = "__unclassified";
export interface DirectoryFilters { search: string; gender: string; month: string; country: string; vocation: string; order: string; status: string }
export const EMPTY_FILTERS: DirectoryFilters = { search: "", gender: "", month: "", country: "", vocation: "", order: "", status: "" };
export interface DirectoryOptions { country: string[]; vocation: string[]; order: string[] }
export type DirectoryDailyCard = Pick<Saint, "slug" | "name" | "kind" | "tagline" | "description">;
