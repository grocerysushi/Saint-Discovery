import { track } from "./analytics";

// One instance per mounted attempt. Backtracking and React effect replays must
// not inflate funnel counts. Answers, gender and scores are never transmitted.
export function createQuizTracker(totalSteps: number, emit = track) {
  const viewed = new Set<number>();
  const answered = new Set<number>();
  let started = false;
  let finished = false;
  const params = (step: number) => ({ quiz_step: step, step_type: step === 1 ? "introduction" : "question", total_steps: totalSteps });
  return {
    view(step: number) {
      if (finished || viewed.has(step)) return;
      viewed.add(step);
      emit("quiz_step_view", params(step));
    },
    answer(step: number) {
      if (finished) return;
      if (!started) { started = true; emit("quiz_start", { total_steps: totalSteps }); }
      if (answered.has(step)) return;
      answered.add(step);
      emit("quiz_step_complete", params(step));
    },
    back(step: number) { if (!finished) emit("quiz_step_back", params(step)); },
    complete(slug: string) {
      if (finished || !started) return false;
      finished = true;
      emit("quiz_complete", { saint_slug: slug, total_steps: totalSteps });
      return true;
    },
  };
}
