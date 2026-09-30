import { TRAIT_KEYS, type QuestionWithOptions, type TraitScores } from "./types";

/** Shuffle choices once per attempt; keep option IDs and their weights together. */
export function shuffleQuizOptions(questions: QuestionWithOptions[], random = Math.random): QuestionWithOptions[] {
  return questions.map(question => {
    const options = [...question.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return { ...question, options };
  });
}

/**
 * Compare each theme against the points actually available to it. Raw totals
 * otherwise favor themes with more high-scoring choices. This is editorial
 * calibration of a discovery quiz, not a validated personality assessment.
 * Apply once on completion, including for the profile and related matches.
 */
export function normalizeQuizScores(scores: TraitScores, questions: QuestionWithOptions[]): TraitScores {
  return Object.fromEntries(TRAIT_KEYS.map(key => {
    const maximum = questions.reduce((sum, question) => sum + Math.max(0,
      ...question.options.map(option => option[`trait_${key}`])), 0);
    return [key, maximum > 0 ? scores[key] / maximum * 100 : 0];
  })) as unknown as TraitScores;
}
