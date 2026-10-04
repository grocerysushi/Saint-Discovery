import { getBiographyUpdatedOn } from "./directory-editorial";
import { getSaintLearningGuide } from "./saint-learning-guides";

// ISO dates sort chronologically. A newer biography or reading guide must not
// be hidden by an older contribution date. This is a content date, not build time.
export function getProfileUpdatedOn(slug: string): string | undefined {
  return [getBiographyUpdatedOn(slug), getSaintLearningGuide(slug)?.reviewedOn]
    .filter((value): value is string => Boolean(value)).sort().at(-1);
}
