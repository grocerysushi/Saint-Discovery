import { analyticsAllowed } from "./visitor-privacy";

export const TRACELEAF_QUIZ_ATTEMPT_KEY = "sd:traceleaf-quiz:v1";
const ATTEMPT_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
type Attempt = { id: string; furthestStep: number };
type TraceleafTracker = NonNullable<Window["traceleaf"]>;

function activeTracker(): TraceleafTracker | undefined {
  if (typeof window === "undefined" || window["ga-disable-G-C75CMC27YN"] ||
      window.navigator.doNotTrack === "yes" || (window as Window & { doNotTrack?: string }).doNotTrack === "1" ||
      !analyticsAllowed()) return;
  return window.traceleaf;
}

export function trackTraceleaf(...args: Parameters<TraceleafTracker["track"]>) {
  try { activeTracker()?.track(...args); } catch { /* Analytics must not interrupt the interface. */ }
}

export function clearTraceleafQuizAttempt() {
  try { window.sessionStorage.removeItem(TRACELEAF_QUIZ_ATTEMPT_KEY); } catch { /* Tab storage is optional. */ }
}

export function createTraceleafQuizAttempt() {
  let attempt: Attempt | "legacy" | null = null;

  function remember(value: Attempt) {
    attempt = value;
    try { window.sessionStorage.setItem(TRACELEAF_QUIZ_ATTEMPT_KEY, JSON.stringify(value)); } catch { /* Continue in memory. */ }
  }

  function reset() {
    attempt = null;
    clearTraceleafQuizAttempt();
  }

  return {
    restore(resuming: boolean) {
      if (!resuming || !activeTracker()) {
        reset();
        return;
      }
      attempt = "legacy";
      try {
        const saved: Attempt | null = JSON.parse(window.sessionStorage.getItem(TRACELEAF_QUIZ_ATTEMPT_KEY) ?? "null");
        if (saved && typeof saved.id === "string" && ATTEMPT_ID.test(saved.id) &&
            Number.isInteger(saved.furthestStep) && saved.furthestStep >= 0 && saved.furthestStep <= 21) {
          attempt = saved;
        }
      } catch { /* A restored quiz may predate attempt tracking. */ }
    },
    start() {
      if (attempt || !activeTracker()) return;
      try {
        const id = window.crypto.randomUUID();
        remember({ id, furthestStep: 0 });
        trackTraceleaf("quiz_start", { attempt: id });
      } catch { /* Continue the quiz when tracking is unavailable. */ }
    },
    view(step: number) {
      if (!attempt || attempt === "legacy" || step <= attempt.furthestStep || !activeTracker()) return;
      remember({ ...attempt, furthestStep: step });
      trackTraceleaf("quiz_step", { attempt: attempt.id, step });
    },
    complete() {
      if (attempt === "legacy") trackTraceleaf("quiz_complete");
      else if (attempt) trackTraceleaf("quiz_complete", { attempt: attempt.id });
      reset();
    },
    reset,
  };
}
