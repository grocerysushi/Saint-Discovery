import { type Saint, type TraitScores, TRAIT_KEYS } from "./types";

export const MATCHING_VERSION = "balanced-profile-v2";

export interface SaintMatch {
  saint: Saint;
  /** Profile similarity, not a probability, personality accuracy or holiness rating. */
  similarity: number;
}

function proportions(values: number[]): number[] | null {
  if (values.some(value => !Number.isFinite(value) || value < 0)) return null;
  // Scale first to keep the sum finite even for unusually large inputs.
  const maximum = Math.max(...values);
  if (maximum === 0) return values.map(() => 0);
  const scaled = values.map(value => value / maximum);
  const total = scaled.reduce((sum, value) => sum + value, 0);
  return scaled.map(value => value / total);
}

function compareIdentity(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** A stable tie order based on the profile and identity, never directory order. */
function tieKey(profile: string, slug: string): number {
  let hash = 2166136261;
  for (const character of `${profile}:${slug}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
  hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/**
 * Compare relative emphasis across all six themes, independent of point scale.
 * Combine cosine alignment with distance between peak-normalized profiles.
 * Keep the established 0.7 cosine / 0.3 distance influence, but bound the whole
 * result using the maximum possible distance (sqrt(6)). This affine conversion
 * preserves the established ranking while giving a finite 0–1 similarity.
 * Compare preferences without rewarding larger absolute saint ratings or
 * treating them as measured personality data. Ratings are editorial.
 *
 * Scores arrive calibrated for the questionnaire's available points. Do not
 * recalibrate here: saved results and related suggestions use the same profile.
 * Equal similarities use a reproducible profile-based tie order. We do not
 * spread results by popularity or alter a better match to increase variety.
 */
export function rankSaints(scores: TraitScores, saints: Saint[]): SaintMatch[] {
  const profile = proportions(TRAIT_KEYS.map(key => scores[key]));
  if (!profile) throw new RangeError("Quiz scores must be finite and non-negative.");
  const profileKey = profile.map(value => value.toFixed(6)).join(",");
  const magnitude = (values: number[]) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  const userMagnitude = magnitude(profile);
  const userPeak = Math.max(...profile);
  const maximumDistance = Math.sqrt(TRAIT_KEYS.length);
  const seen = new Set<string>();
  const matches: (SaintMatch & { bucket: number; tie: number })[] = [];

  for (const saint of saints) {
    if (seen.has(saint.slug) || saint.kind === "unresolved" || saint.kind === "observance") continue;
    const candidate = proportions(TRAIT_KEYS.map(key => saint[`trait_${key}`]));
    if (!candidate || candidate.every(value => value === 0)) continue;
    seen.add(saint.slug);
    let similarity = 0;
    if (userMagnitude > 0) {
      const cosine = profile.reduce((sum, value, index) => sum + value * candidate[index], 0)
        / (userMagnitude * magnitude(candidate));
      const candidatePeak = Math.max(...candidate);
      const distance = Math.sqrt(profile.reduce((sum, value, index) =>
        sum + (value / userPeak - candidate[index] / candidatePeak) ** 2, 0));
      similarity = Math.min(1, Math.max(0,
        (0.7 * cosine + 0.3 * (maximumDistance - distance)) / (0.7 + 0.3 * maximumDistance)));
    }
    matches.push({ saint, similarity, bucket: Math.round(similarity * 1e12), tie: tieKey(profileKey, saint.slug) });
  }

  return matches.sort((a, b) => b.bucket - a.bucket || a.tie - b.tie || compareIdentity(a.saint.slug, b.saint.slug))
    .map(({ saint, similarity }) => ({ saint, similarity }));
}

export function matchSaint(scores: TraitScores, saints: Saint[]): Saint {
  const best = rankSaints(scores, saints)[0];
  if (!best) throw new Error("No eligible saint profiles are available for this quiz.");
  return best.saint;
}
