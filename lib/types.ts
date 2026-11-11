export interface TraitScores {
  contemplative: number;
  charitable: number;
  intellectual: number;
  courageous: number;
  joyful: number;
  mystical: number;
}

export const TRAIT_KEYS: (keyof TraitScores)[] = [
  "contemplative",
  "charitable",
  "intellectual",
  "courageous",
  "joyful",
  "mystical",
];

export interface Saint {
  directory_only?: boolean;
  alternate_names?: string[];
  kind?: "saint" | "blessed" | "orthodox-saint" | "observance" | "unresolved";
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  prayer: string | null;
  feast_day: string | null;
  gender: string | null;
  emoji?: string | null;
  known_for?: string | null;
  patron_of?: string | null;
  dates?: string | null;
  origin?: string | null;
  quotes?: string[];
  fun_fact?: string | null;
  trait_contemplative: number;
  trait_charitable: number;
  trait_intellectual: number;
  trait_courageous: number;
  trait_joyful: number;
  trait_mystical: number;
  // Template version 2 devotional layer (lib/data/saint-devotions.json).
  // Pages render these sections only when templateVersion === 2.
  heroSummary?: string;
  patronages?: string[];
  symbols?: SaintSymbol[];
  whyWeTurn?: string;
  devotionQuotes?: SaintQuote[];
  devotionPrayer?: SaintPrayer;
  feastCustoms?: string[];
  places?: SaintPlace[];
  confirmationNote?: string;
  reflectionPrompts?: string[];
  relatedSaints?: RelatedSaintLink[];
  templateVersion?: number;
  searchDescription?: string;
}

export interface SaintSymbol { symbol: string; meaning: string }
/** A public-domain quotation: Douay-Rheims Scripture or a public-domain translation of the saint's writing. */
export interface SaintQuote { text: string; work: string; translation: string }
export interface SaintPrayer { text: string; kind: "traditional" | "original"; source: string; note?: string; link?: { label: string; url: string } }
export interface SaintPlace { name: string; city: string; url: string }
/** historical: a documented link (companion, same order, shared feast, same era), not a quiz-theme match. */
export interface RelatedSaintLink { slug: string; reason: string; historical?: boolean }

/** One saint's entry in lib/data/saint-devotions.json (spec field names). */
export interface SaintDevotion {
  heroSummary?: string;
  patronages?: string[];
  symbols?: SaintSymbol[];
  whyWeTurn?: string;
  quotes?: SaintQuote[];
  prayer?: SaintPrayer;
  feastCustoms?: string[];
  places?: SaintPlace[];
  confirmationNote?: string;
  reflectionPrompts?: string[];
  relatedSaints?: RelatedSaintLink[];
  templateVersion: number;
  /** Complete replacement (≤160 chars) for a search description that would otherwise be cut off. */
  searchDescription?: string;
  /** Sources consulted for the devotional fields (not rendered as a list; kept for review). */
  sources?: { title: string; url: string }[];
  /** Fields deliberately left empty, with reasons, for the needs-review log. */
  flags?: string[];
}

export interface Question {
  id: string;
  sort_order: number;
  text: string;
}

export interface Option {
  id: string;
  question_id: string;
  label: string;
  source?: { label: string; url: string };
  trait_contemplative: number;
  trait_charitable: number;
  trait_intellectual: number;
  trait_courageous: number;
  trait_joyful: number;
  trait_mystical: number;
}

export interface QuestionWithOptions extends Question {
  options: Option[];
}
