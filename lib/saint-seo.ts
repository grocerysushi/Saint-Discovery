import type { Saint } from "@/lib/types";
import { getSaintReaderGuide } from "@/lib/saint-reader-guides";

// These entries describe observances rather than individual people. Avoid
// adding a saint title to them or asserting Person schema for every record.
const OBSERVANCES = new Set(["all-saints", "all-souls", "guardian-angels"]);

export function saintDisplayName(saint: Pick<Saint, "name" | "slug" | "kind">) {
  if (saint.kind === "observance" || saint.kind === "unresolved") return saint.name;
  if (saint.kind === "blessed") return /^Blessed /i.test(saint.name) ? saint.name : `Blessed ${saint.name}`;
  if (OBSERVANCES.has(saint.slug) || /^(St\.? |Saint |Blessed |Our Lady\b)/i.test(saint.name)) return saint.name;
  return `St. ${saint.name}`;
}

export function saintSearchSummary(saint: Saint) {
  const name = saintDisplayName(saint);
  const guide = getSaintReaderGuide(saint.slug);
  if (guide) return { name, title: guide.title, description: guide.description };
  const sections = ["Biography", saint.feast_day && "Feast Day", saint.prayer && "Prayer"].filter(Boolean);
  const title = `${name}: ${sections.join(", ")}`;
  const raw = [
    `Discover ${name}.`,
    saint.feast_day && `Feast day: ${saint.feast_day}.`,
    saint.patron_of && `Patronage: ${saint.patron_of}.`,
    saint.known_for || saint.description,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  // A reviewed, complete sentence replaces a summary that would be cut off.
  const description = raw.length <= 160 ? raw : saint.searchDescription ?? `${raw.slice(0, 157).replace(/\s+\S*$/, "")}…`;
  return { name, title, description };
}

// Abbreviations that end in a period but do not end a sentence.
const ABBREVIATION = /(?:^|\s)(?:St|Sts|Bl|Fr|Mt|Dr|Jr|Sr|Br|Mr|Mrs|Ms|No|Vol|c|ca|b|d|r|A\.D|B\.C|[A-Z])\.$/;

/**
 * A short excerpt of the saint's reviewed description for lists: whole
 * sentences up to `max` characters, or a word-boundary cut with an ellipsis.
 */
export function saintShortSummary(saint: Pick<Saint, "description">, max = 220): string {
  const text = (saint.description ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  let end = 0;
  for (const match of text.matchAll(/[.!?](?=\s+["“‘(]?[A-Z0-9])/g)) {
    const at = match.index! + 1;
    if (at > max) break;
    if (!ABBREVIATION.test(text.slice(0, at))) end = at;
  }
  if (end >= 60) return text.slice(0, end);
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[\s,;:.!?]+$/, "")}…`;
}
