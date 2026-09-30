import { rankSaints } from "./scoring";
import { TRAIT_KEYS, type Saint, type TraitScores } from "./types";

export function resultPath(slug: string) {
  return `/quiz/results/${encodeURIComponent(slug)}`;
}

export function strongestTraits(scores: TraitScores) {
  return [...TRAIT_KEYS].filter(key => scores[key] > 0).sort((a, b) => scores[b] - scores[a]).slice(0, 2);
}

export function moreQuizSaints(scores: TraitScores, saints: Saint[], matchedSlug: string) {
  return rankSaints(scores, saints.filter(saint => saint.slug !== matchedSlug))
    .slice(0, 3).map(match => match.saint);
}
