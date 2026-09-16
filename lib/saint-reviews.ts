import reviewData from "@/lib/data/saint-reviews.json";
import research1 from "@/lib/data/saint-reviews-research1.json";
import research2 from "@/lib/data/saint-reviews-research2.json";
import research3 from "@/lib/data/saint-reviews-research3.json";
import rootReviews from "@/lib/data/saint-reviews-root.json";
import type { Saint } from "@/lib/types";

export interface BiographyReview {
  status: "source-reviewed" | "needs-identification";
  reviewed_on: string;
  review_method: string;
  name: string;
  kind: "saint" | "blessed" | "orthodox-saint" | "observance" | "unresolved";
  feast_day: string | null;
  feast_note: string;
  origin: string | null;
  dates: string | null;
  patron_of: string | null;
  biography: string[];
  sources: { title: string; url: string }[];
  quotes: string[];
  prayer: string | null;
  fun_fact: string | null;
}

interface DuplicateReview {
  status: "duplicate";
  canonical_slug: string;
  reviewed_on: string;
  reason: string;
}

export const reviews: Record<string, BiographyReview | DuplicateReview> = {};
for (const batch of [reviewData, research1, research2, research3, rootReviews]) {
  for (const [slug, review] of Object.entries(batch)) {
    if (reviews[slug]) throw new Error(`Duplicate biography review: ${slug}`);
    reviews[slug] = review as BiographyReview | DuplicateReview;
  }
}

export function canonicalSaintSlug(slug: string): string {
  const review = reviews[slug];
  return review?.status === "duplicate" ? review.canonical_slug : slug;
}

export function getBiographyReview(slug: string): BiographyReview | null {
  const review = reviews[canonicalSaintSlug(slug)];
  return review && review.status !== "duplicate" ? review : null;
}

// Keep researched corrections separate from the legacy seed generator.
// Missing reviews remain pending; they must never inherit a verified label.
export function applySaintReview(saint: Saint): Saint {
  const review = getBiographyReview(saint.slug);
  if (!review) return saint;
  return {
    ...saint,
    slug: canonicalSaintSlug(saint.slug),
    name: review.name,
    kind: review.kind,
    description: review.biography[0],
    tagline: "",
    known_for: null,
    feast_day: review.feast_day,
    dates: review.dates,
    origin: review.origin,
    patron_of: review.patron_of,
    quotes: review.quotes,
    prayer: review.prayer,
    fun_fact: review.fun_fact,
  };
}
