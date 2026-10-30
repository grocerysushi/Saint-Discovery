export function patronSearchMatch(query: string, fields: string[]): boolean {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const text = normalize(fields.join(" "));
  return terms.every(term => text.includes(term));
}

// Search vocabulary only; these do not create or change patronage claims.
export const PATRON_SEARCH_TERMS: Record<string, string> = {
  parents: "family parenting mother father children",
  students: "study school college exams education learning",
  nurses: "care nursing healthcare hospital",
  blacksmiths: "work metal craft smith metalworker",
  grief: "loss bereavement mourning",
  "difficult-decisions": "choice choices discernment decision uncertainty",
};
