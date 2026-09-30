import { track } from "./analytics";
import { MATCHING_VERSION } from "./scoring";

// Distinguish the revised questions/weights from earlier funnel data.
const QUIZ_VERSION = "2026-09-30";

// One instance per mounted attempt. Backtracking and React effect replays must
// not inflate funnel counts. Answers, gender and scores are never transmitted.
export function createQuizTracker(totalSteps: number, emit = track) {
  const viewed = new Set<number>();
  const answered = new Set<number>();
  let started = false;
  let finished = false;
  const params = (step: number) => ({ quiz_version: QUIZ_VERSION, quiz_step: step, step_type: step === 1 ? "introduction" : "question", total_steps: totalSteps });
  return {
    view(step: number) {
      if (finished || viewed.has(step)) return;
      viewed.add(step);
      emit("quiz_step_view", params(step));
    },
    answer(step: number) {
      if (finished) return;
      if (!started) { started = true; emit("quiz_start", { quiz_version: QUIZ_VERSION, total_steps: totalSteps }); }
      if (answered.has(step)) return;
      answered.add(step);
      emit("quiz_step_complete", params(step));
    },
    back(step: number) { if (!finished) emit("quiz_step_back", params(step)); },
    complete(slug: string) {
      if (finished || !started) return false;
      finished = true;
      emit("quiz_complete", { quiz_version: QUIZ_VERSION, match_algorithm_version: MATCHING_VERSION, saint_slug: slug, total_steps: totalSteps });
      return true;
    },
  };
}
