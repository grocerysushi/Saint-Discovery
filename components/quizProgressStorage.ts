import { parseQuizProgress, serializeQuizProgress, type QuizProgress } from "@/lib/quiz-progress";
import type { QuestionWithOptions } from "@/lib/types";

export const QUIZ_PROGRESS_KEY = "saint-discovery:quiz-progress:v1";
let memory: string | null = null;
let memoryOnly = false;
export function readQuizProgress(questions: QuestionWithOptions[]): QuizProgress | null {
  let raw = memory;
  if (!memoryOnly) try { raw = window.sessionStorage.getItem(QUIZ_PROGRESS_KEY); } catch { /* In-memory fallback. */ }
  return parseQuizProgress(raw, questions);
}
export function writeQuizProgress(progress: QuizProgress | null): void {
  memory = progress ? serializeQuizProgress(progress) : null;
  try {
    if (memory) window.sessionStorage.setItem(QUIZ_PROGRESS_KEY, memory);
    else window.sessionStorage.removeItem(QUIZ_PROGRESS_KEY);
    memoryOnly = false;
  } catch { memoryOnly = true; }
}
