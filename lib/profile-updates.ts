import { getBiographyReview } from "./saint-reviews";
import { getSaintContribution } from "./saint-contributions";
import { getSaintLearningGuide } from "./saint-learning-guides";

// ISO dates sort chronologically. A newer biography or reading guide must not
// be hidden by an older contribution date. This is a content date, not build time.
export function getProfileUpdatedOn(slug: string): string | undefined {
  return [getBiographyReview(slug)?.reviewed_on, getSaintContribution(slug)?.reviewed_on, getSaintLearningGuide(slug)?.reviewedOn]
    .filter((value): value is string => Boolean(value)).sort().at(-1);
}
