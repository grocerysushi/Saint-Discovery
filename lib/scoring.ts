import { Saint, TraitScores, TRAIT_KEYS } from "./types";

function toTraitScores(saint: Saint): TraitScores {
  return {
    contemplative: saint.trait_contemplative,
    charitable: saint.trait_charitable,
    intellectual: saint.trait_intellectual,
    courageous: saint.trait_courageous,
    joyful: saint.trait_joyful,
    mystical: saint.trait_mystical,
  };
}

function dotProduct(a: TraitScores, b: TraitScores): number {
  return TRAIT_KEYS.reduce((sum, key) => sum + a[key] * b[key], 0);
}

function magnitude(v: TraitScores): number {
  return Math.sqrt(TRAIT_KEYS.reduce((sum, key) => sum + v[key] * v[key], 0));
}

/** Euclidean distance between two normalized trait vectors (scaled to 0-1 range) */
function normalizedDistance(a: TraitScores, b: TraitScores): number {
  const maxA = Math.max(...TRAIT_KEYS.map((k) => a[k]), 1);
  const maxB = Math.max(...TRAIT_KEYS.map((k) => b[k]), 1);
  return Math.sqrt(
    TRAIT_KEYS.reduce((sum, key) => {
      const diff = a[key] / maxA - b[key] / maxB;
      return sum + diff * diff;
    }, 0)
  );
}

/**
 * Match user scores to the best saint using a combined scoring approach:
 * - Cosine similarity (direction alignment of trait vectors)
 * - Normalized distance penalty (penalizes saints whose trait shape differs)
 *
 * This produces better differentiation across 500+ saints than
 * cosine similarity alone.
 */
export function matchSaint(scores: TraitScores, saints: Saint[]): Saint {
  let bestSaint = saints[0];
  let bestScore = -Infinity;

  const magUser = magnitude(scores);
  if (magUser === 0) return saints[Math.floor(Math.random() * saints.length)];

  for (const saint of saints) {
    const saintScores = toTraitScores(saint);
    const magSaint = magnitude(saintScores);
    if (magSaint === 0) continue;

    // Cosine similarity: how aligned are the trait directions (0 to 1)
    const cosine = dotProduct(scores, saintScores) / (magUser * magSaint);

    // Normalized distance: how close are the trait shapes (0 = identical)
    const dist = normalizedDistance(scores, saintScores);

    // Combined score: 70% cosine similarity + 30% closeness (1 - distance)
    const combined = 0.7 * cosine + 0.3 * (1 - dist);

    if (combined > bestScore) {
      bestScore = combined;
      bestSaint = saint;
    }
  }

  return bestSaint;
}
