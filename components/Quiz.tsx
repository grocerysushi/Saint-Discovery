"use client";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion } from "framer-motion";
import { type Saint, type QuestionWithOptions, type Option, TRAIT_KEYS } from "@/lib/types";
import { matchSaint } from "@/lib/scoring";
import { normalizeQuizScores, shuffleQuizOptions } from "@/lib/quiz-questions";
import { quizProgressReducer, quizProgressScores } from "@/lib/quiz-progress";
import { readQuizProgress, writeQuizProgress } from "./quizProgressStorage";
import { createQuizTracker } from "@/lib/quiz-analytics";
import quizData from "@/lib/data/quiz.json";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";
import Result from "./Result";
import { moreQuizSaints } from "@/lib/quiz-results";
import { getSavedQuizResult, saveQuizResult, useQuizSession } from "./useQuizSession";
import DiscoverySample from "./DiscoverySample";
import Link from "next/link";

const QUESTIONS: QuestionWithOptions[] = quizData.questions.map(q => ({
  ...q, options: (quizData.options as Option[]).filter(o => o.question_id === q.id),
}));

// Reviewed candidates arrive with this page; answering never requires a backend request.
export default function Quiz({ saints, onRestart, onExit, home = false }: { saints: Saint[]; onRestart: () => void; onExit: () => void; home?: boolean }) {
  const saved = useQuizSession();
  const [progress, dispatch] = useReducer(quizProgressReducer, null, () => ({
    questions: shuffleQuizOptions(QUESTIONS), gender: null, answerIds: [], ready: false,
  }));
  const { questions, gender, answerIds, ready } = progress;
  const current = answerIds.length;
  const scores = useMemo(() => quizProgressScores(progress), [progress]);
  const [result, setResult] = useState<{ saint: Saint; scores: ReturnType<typeof normalizeQuizScores> } | null>(null);
  const [analytics] = useState(() => createQuizTracker(QUESTIONS.length + 1));
  const selectionLocked = useRef(false);
  const genderHeading = useRef<HTMLHeadingElement>(null);
  const pauseDialog = useRef<HTMLDialogElement>(null);
  const [paused, setPaused] = useState(false);
  const totalSteps = questions.length + 1;
  const currentStep = gender === null ? 0 : current + 1;

  // Restore after hydration so the server and first browser render remain identical.
  useEffect(() => { dispatch({ type: "restore", progress: readQuizProgress(QUESTIONS) }); }, []);
  useEffect(() => {
    if (!ready) return;
    const completed = getSavedQuizResult();
    writeQuizProgress(result || (completed && saints.some(s => s.slug === completed.slug)) || gender === null ? null : progress);
  }, [ready, progress, result, gender, saints]);
  useEffect(() => { if (ready && gender === null) genderHeading.current?.focus({ preventScroll: true }); }, [gender, ready]);
  useEffect(() => { if (ready) window.scrollTo({ top: 0, behavior: "instant" }); }, [currentStep, ready]);
  useEffect(() => {
    selectionLocked.current = false;
    if (!ready) return;
    const restored = getSavedQuizResult();
    if (result || (restored && saints.some(saint => saint.slug === restored.slug))) return;
    analytics.view(currentStep + 1);
  }, [analytics, currentStep, result, ready, saints]);

  const handleGenderSelect = (selected: "Male" | "Female" | "Any") => {
    if (!ready || selectionLocked.current) return;
    selectionLocked.current = true;
    analytics.answer(1);
    dispatch({ type: "gender", gender: selected });
  };
  const handleSelect = (optionId: string) => {
    if (!ready || selectionLocked.current) return;
    const opt = questions[current].options.find(o => o.id === optionId);
    if (!opt) return;
    selectionLocked.current = true;
    analytics.answer(current + 2);
    const newScores = { ...scores };
    for (const key of TRAIT_KEYS) newScores[key] += opt[`trait_${key}`];
    if (current + 1 < questions.length) {
      dispatch({ type: "answer", id: optionId });
    } else {
      const filtered = gender === "Any" ? saints : saints.filter(s => s.gender === gender);
      const normalizedScores = normalizeQuizScores(newScores, questions);
      const matched = matchSaint(normalizedScores, filtered.length > 0 ? filtered : saints);
      setResult({ saint: matched, scores: normalizedScores });
      saveQuizResult({ version: 1, slug: matched.slug, gender: gender ?? "Male", scores: normalizedScores });
      writeQuizProgress(null);
      analytics.complete(matched.slug);
    }
  };
  const handleBack = () => {
    if (!ready || selectionLocked.current) return;
    selectionLocked.current = true;
    analytics.back(currentStep + 1);
    dispatch({ type: "back" });
  };
  const restart = () => { setPaused(false); writeQuizProgress(null); saveQuizResult(null); onRestart(); };
  const displayedResult = result?.saint ?? (saved ? saints.find(saint => saint.slug === saved.slug) : null);
  if (displayedResult) return <Result saint={displayedResult} scores={result?.scores ?? saved!.scores}
    relatedSaints={moreQuizSaints(result?.scores ?? saved!.scores, (result ? gender : saved!.gender) === "Any" ? saints : saints.filter(saint => saint.gender === (result ? gender : saved!.gender)), displayedResult.slug)} onRestart={restart} />;

  const quiz = <div className="quiz-shell">
    {gender !== null && <div className="quiz-focus-tools"><span>A little space to discover</span><button type="button" onClick={() => pauseDialog.current?.showModal()}>Pause <span aria-hidden>Ⅱ</span></button></div>}
    <ProgressBar current={currentStep} total={totalSteps} />
    {gender === null ? <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="question-card" aria-labelledby="gender-heading">
      <p className="eyebrow">Let’s start with you</p>
      <h1 ref={genderHeading} tabIndex={-1} id="gender-heading" className="question-title outline-none">What is your gender?</h1>
      <p className="text-cream-dark text-sm leading-relaxed mb-6">Your answer determines whether your match is selected from male or female saints.</p>
      <div className="question-options"><OptionButton label="Male" index={0} onSelect={() => handleGenderSelect("Male")} /><OptionButton label="Female" index={1} onSelect={() => handleGenderSelect("Female")} /></div>
    </motion.section> : <QuestionCard key={questions[current].id} question={questions[current]} onSelect={handleSelect} />}
    <div className="flex flex-wrap justify-between gap-4">
      {(!home || gender !== null) && <button type="button" onClick={gender === null ? onExit : handleBack} className="quiz-back">← {gender === null ? "Back to discovery" : "Previous question"}</button>}
      {gender !== null && <button type="button" onClick={restart} className="quiz-back">Start over</button>}
    </div>
    <p className="quiz-hint">No right or wrong answers. Choose what feels most like you.</p>
    {gender !== null && <p className="quiz-hint">Progress is saved in this browser tab. Start over clears your answers. Browser settings may limit recovery.</p>}
  </div>;
  return <div className={gender !== null && !paused ? "quiz-focused" : "quiz-entry"}>
    <div className={gender === null || paused ? "discovery-entry-grid" : undefined}>
      {(gender === null || paused) && <DiscoverySample />}
      {paused ? <section className="quiz-resume"><p>Your discovery is waiting</p><h1>Your place is held.</h1><p>Continue at step {currentStep + 1} of {totalSteps}.</p><button type="button" className="btn-primary" onClick={() => { setPaused(false); window.scrollTo({ top: 0, behavior: "instant" }); }}>Resume my discovery</button><p className="text-sm">Progress stays in this browser tab. Start over clears your answers.</p><Link prefetch={false} href="/resources" className="text-link">Explore the saints</Link></section> : <div className="quiz-entry-content">{gender === null && <div className="quiz-entry-intro"><p>A life you haven’t met.<br />A story that stays.</p><span>Discover your saint through 21 simple questions.<br /> Then get to know the person behind your match.</span></div>}{quiz}{gender === null && <p className="quiz-entry-promise">Free to take · About 3–5 minutes · No account needed</p>}</div>}
    </div>
    <dialog ref={pauseDialog} className="discovery-dialog" aria-labelledby="pause-title"><button type="button" className="dialog-close" aria-label="Close pause dialog" onClick={() => pauseDialog.current?.close()}>×</button><h2 id="pause-title">Come back to it.</h2><p>Your progress stays in this browser tab. Take a breath or explore without starting over. Browser settings may limit recovery.</p><button type="button" className="btn-primary" onClick={() => pauseDialog.current?.close()}>Keep going</button><button type="button" className="text-link" onClick={() => { pauseDialog.current?.close(); setPaused(true); window.scrollTo({ top: 0, behavior: "instant" }); }}>Pause and explore</button></dialog>
    {!home && paused && <p className="site-width"><Link href="/" prefetch={false}>Return to the homepage</Link></p>}
  </div>;
}
