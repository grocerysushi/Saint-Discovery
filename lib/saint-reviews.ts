import reviewData from "@/lib/data/saint-reviews.json";
import research1 from "@/lib/data/saint-reviews-research1.json";
import research2 from "@/lib/data/saint-reviews-research2.json";
import research3 from "@/lib/data/saint-reviews-research3.json";
import rootReviews from "@/lib/data/saint-reviews-root.json";
import expansions1 from "@/lib/data/saint-biography-expansions-1.json";
import expansions2 from "@/lib/data/saint-biography-expansions-2.json";
import expansions3 from "@/lib/data/saint-biography-expansions-3.json";
import expansions4 from "@/lib/data/saint-biography-expansions-4.json";
import type { Saint } from "@/lib/types";
import catholicRecognition from "@/lib/data/catholic-recognition.json";
import directoryAdditions from "@/lib/data/directory-additions.json";

export interface BiographyReview {
  recognition_note?: string;
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

// Expansion files replace editorial content only; researched identity corrections stay intact.
for (const entry of directoryAdditions) {
  if (reviews[entry.saint.slug]) throw new Error(`Duplicate directory identity: ${entry.saint.slug}`);
  reviews[entry.saint.slug] = entry.review as BiographyReview;
}

const expandedSlugs = new Set<string>();
for (const batch of [expansions1, expansions2, expansions3, expansions4]) {
  for (const [slug, expansion] of Object.entries(batch)) {
    const review = reviews[slug];
    if (!review || review.status !== "source-reviewed") {
      throw new Error(`Biography expansion requires a reviewed canonical identity: ${slug}`);
    }
    if (expandedSlugs.has(slug)) throw new Error(`Duplicate biography expansion: ${slug}`);
    expandedSlugs.add(slug);
    reviews[slug] = {
      ...review,
      biography: expansion.biography,
      sources: expansion.sources,
      reviewed_on: expansion.reviewed_on,
      review_method: expansion.review_method,
    };
  }
}

export function canonicalSaintSlug(slug: string): string {
  const review = reviews[slug];
  return review?.status === "duplicate" ? review.canonical_slug : slug;
}

export function getBiographyReview(slug: string): BiographyReview | null {
  const canonical = canonicalSaintSlug(slug);
  const review = reviews[canonical];
  if (!review || review.status === "duplicate") return null;
  const recognition = (catholicRecognition as Record<string, { kind: "saint"; feast_day: string | null; feast_note: string; sources: { title: string; url: string }[]; recognition_note: string }>)[canonical];
  return recognition ? { ...review, ...recognition, reviewed_on: "2026-10-01", sources: [...review.sources, ...recognition.sources] } : review;
}

// Archived reviews stay in source control; every public catalog consumer uses
// this policy, including aliases, quizzes, patron links and daily selections.
export function isPublishedSaintSlug(slug: string): boolean {
  const review = getBiographyReview(slug);
  return review?.status === "source-reviewed" && review.kind === "saint";
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
