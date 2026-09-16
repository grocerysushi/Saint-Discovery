import { TRAIT_KEYS, type TraitScores } from "./types";

export interface SavedQuizResult { version: 1; slug: string; gender: string; scores: TraitScores }
export function parseQuizResult(raw: string | null): SavedQuizResult | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || typeof value.slug !== "string" || !/^[a-z0-9-]+$/.test(value.slug) || !["Male", "Female"].includes(value.gender)) return null;
    if (!value.scores || !TRAIT_KEYS.every(key => Number.isFinite(value.scores[key]) && value.scores[key] >= 0 && value.scores[key] <= 10000)) return null;
    return { version: 1, slug: value.slug, gender: value.gender, scores: Object.fromEntries(TRAIT_KEYS.map(key => [key, value.scores[key]])) as unknown as TraitScores };
  } catch { return null; }
}
