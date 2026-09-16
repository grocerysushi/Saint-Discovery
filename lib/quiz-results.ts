import { matchSaint } from "./scoring";
import { TRAIT_KEYS, type Saint, type TraitScores } from "./types";

export function resultPath(slug: string) {
  return `/quiz/results/${encodeURIComponent(slug)}`;
}

export function strongestTraits(scores: TraitScores) {
  return [...TRAIT_KEYS].filter(key => scores[key] > 0).sort((a, b) => scores[b] - scores[a]).slice(0, 2);
}

export function moreQuizSaints(scores: TraitScores, saints: Saint[], matchedSlug: string) {
  const seen = new Set([matchedSlug]);
  let pool = saints.filter(saint => {
    if (seen.has(saint.slug) || saint.kind === "unresolved" || saint.kind === "observance") return false;
    seen.add(saint.slug);
    return true;
  });
  const results: Saint[] = [];
  while (pool.length && results.length < 3) {
    const saint = matchSaint(scores, pool);
    results.push(saint);
    pool = pool.filter(candidate => candidate.slug !== saint.slug);
  }
  return results;
}
