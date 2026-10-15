import { TRAIT_KEYS, type QuestionWithOptions, type TraitScores } from "./types";

export interface QuizProgress {
  questions: QuestionWithOptions[];
  gender: "Male" | "Female" | null;
  answerIds: string[];
  ready: boolean;
}

// Store identities and order, never content or scores supplied by browser storage.
export function serializeQuizProgress(progress: QuizProgress): string {
  return JSON.stringify({ version: 1, gender: progress.gender, answers: progress.answerIds,
    order: progress.questions.map(q => ({ question: q.id, options: q.options.map(o => o.id) })) });
}

export function parseQuizProgress(raw: string | null, questions: QuestionWithOptions[]): QuizProgress | null {
  if (!raw || raw.length > 32000) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || ![null, "Male", "Female"].includes(value.gender)
      || !Array.isArray(value.order) || value.order.length !== questions.length
      || !Array.isArray(value.answers) || value.answers.length >= questions.length
      || (value.gender === null && value.answers.length > 0)) return null;
    const restored: QuestionWithOptions[] = questions.map((question, index) => {
      const order = value.order[index];
      if (order?.question !== question.id || !Array.isArray(order.options)
        || order.options.length !== question.options.length || new Set(order.options).size !== question.options.length) throw new Error("Outdated order");
      return { ...question, options: order.options.map((id: unknown) => {
        const option = question.options.find(o => o.id === id);
        if (!option) throw new Error("Unknown option");
        return option;
      }) };
    });
    if (!value.answers.every((id: unknown, index: number) => restored[index].options.some(o => o.id === id))) return null;
    return { questions: restored, gender: value.gender, answerIds: value.answers, ready: true };
  } catch { return null; }
}

export function quizProgressScores(progress: Pick<QuizProgress, "questions" | "answerIds">): TraitScores {
  const scores = Object.fromEntries(TRAIT_KEYS.map(key => [key, 0])) as unknown as TraitScores;
  progress.answerIds.forEach((id, index) => {
    const option = progress.questions[index].options.find(o => o.id === id);
    if (option) for (const key of TRAIT_KEYS) scores[key] += option[`trait_${key}`];
  });
  return scores;
}

type Action = { type: "restore"; progress: QuizProgress | null }
  | { type: "gender"; gender: "Male" | "Female" } | { type: "answer"; id: string } | { type: "back" };
export function quizProgressReducer(state: QuizProgress, action: Action): QuizProgress {
  switch (action.type) {
    case "restore": return state.ready ? state : action.progress ?? { ...state, ready: true };
    case "gender": return { ...state, gender: action.gender };
    case "answer": return { ...state, answerIds: [...state.answerIds, action.id] };
    case "back": return state.answerIds.length ? { ...state, answerIds: state.answerIds.slice(0, -1) } : { ...state, gender: null };
  }
}
