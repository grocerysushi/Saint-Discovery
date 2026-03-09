import { Saint, TraitScores, TRAIT_KEYS } from "./types";

function dotProduct(a: TraitScores, b: TraitScores): number {
  return TRAIT_KEYS.reduce((sum, key) => sum + a[key] * b[key], 0);
}

function magnitude(v: TraitScores): number {
  return Math.sqrt(TRAIT_KEYS.reduce((sum, key) => sum + v[key] * v[key], 0));
}

export function matchSaint(scores: TraitScores, saints: Saint[]): Saint {
  let bestSaint = saints[0];
  let bestSim = -Infinity;

  for (const saint of saints) {
    const saintScores: TraitScores = {
      contemplative: saint.trait_contemplative,
      charitable: saint.trait_charitable,
      intellectual: saint.trait_intellectual,
      courageous: saint.trait_courageous,
      joyful: saint.trait_joyful,
      mystical: saint.trait_mystical,
    };

    const magA = magnitude(scores);
    const magB = magnitude(saintScores);
    if (magA === 0 || magB === 0) continue;

    const similarity = dotProduct(scores, saintScores) / (magA * magB);
    if (similarity > bestSim) {
      bestSim = similarity;
      bestSaint = saint;
    }
  }

  return bestSaint;
}
