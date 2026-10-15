// Used by the server page only: full editorial reviews must not enter the quiz bundle.
import quizSaints from "./data/quiz-saints.json";
import { applySaintReview, canonicalSaintSlug } from "./saint-reviews";
import type { Saint } from "./types";

export function getQuizCandidates(): Saint[] {
  return (quizSaints as Saint[])
    .filter(saint => canonicalSaintSlug(saint.slug) === saint.slug)
    .map(applySaintReview)
    .filter(saint => saint.kind === "saint")
    .map(saint => ({
      id: saint.id, slug: saint.slug, name: saint.name, kind: saint.kind,
      directory_only: saint.directory_only, gender: saint.gender,
      tagline: saint.tagline, description: saint.description,
      feast_day: saint.feast_day, prayer: saint.prayer,
      trait_contemplative: saint.trait_contemplative, trait_charitable: saint.trait_charitable,
      trait_intellectual: saint.trait_intellectual, trait_courageous: saint.trait_courageous,
      trait_joyful: saint.trait_joyful, trait_mystical: saint.trait_mystical,
    }));
}
