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
