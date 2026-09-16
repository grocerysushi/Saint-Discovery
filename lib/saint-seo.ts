import type { Saint } from "@/lib/types";

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
  const sections = ["Biography", saint.feast_day && "Feast Day", saint.prayer && "Prayer"].filter(Boolean);
  const title = `${name}: ${sections.join(", ")}`;
  const raw = [
    `Discover ${name}.`,
    saint.feast_day && `Feast day: ${saint.feast_day}.`,
    saint.patron_of && `Patronage: ${saint.patron_of}.`,
    saint.known_for || saint.description,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const description = raw.length <= 160 ? raw : `${raw.slice(0, 157).replace(/\s+\S*$/, "")}…`;
  return { name, title, description };
}
