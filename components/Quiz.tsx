"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getInsforgePublic } from "@/lib/insforge";
import { Saint, QuestionWithOptions, Option, TraitScores, TRAIT_KEYS } from "@/lib/types";
import { matchSaint } from "@/lib/scoring";
import { track } from "@/lib/analytics";
import quizData from "@/lib/data/quiz.json";
import quizSaints from "@/lib/data/quiz-saints.json";
import { applySaintReview, canonicalSaintSlug } from "@/lib/saint-reviews";
import saintDbIds from "@/lib/data/saint-db-ids.json";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";
import Result from "./Result";
import { moreQuizSaints } from "@/lib/quiz-results";
import { saveQuizResult, useQuizSession } from "./useQuizSession";

// Quiz content ships with the bundle (lib/data/*.json) so the quiz works even
// if the backend is unreachable; only result logging touches the network.
const QUESTIONS: QuestionWithOptions[] = quizData.questions.map((q) => ({
  ...q,
  options: (quizData.options as Option[]).filter(
    (o) => o.question_id === q.id
  ),
}));
const SAINTS = (quizSaints as Saint[])
  .filter(saint => canonicalSaintSlug(saint.slug) === saint.slug)
  .map(applySaintReview)
  .filter(saint => saint.kind !== "unresolved" && saint.kind !== "observance");

export default function Quiz({ onRestart, onExit }: { onRestart: () => void; onExit: () => void }) {
  const saved = useQuizSession();
  const [questions] = useState<QuestionWithOptions[]>(QUESTIONS);
  const [saints] = useState<Saint[]>(SAINTS);
  const [gender, setGender] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<TraitScores>({
    contemplative: 0,
    charitable: 0,
    intellectual: 0,
    courageous: 0,
    joyful: 0,
    mystical: 0,
  });
  // Chosen option per answered question, so Back can rewind the score.
  const [answers, setAnswers] = useState<Option[]>([]);
  const [result, setResult] = useState<Saint | null>(null);
  const genderHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (gender === null) genderHeading.current?.focus({ preventScroll: true }); }, [gender]);

  // Total steps = 1 (gender) + number of trait questions
  const totalSteps = questions.length + 1;
  // Current step: 0 = gender, 1+ = trait questions
  const currentStep = gender === null ? 0 : current + 1;

  const handleGenderSelect = (selected: string) => {
    setGender(selected);
  };

  const handleSelect = (optionId: string) => {
    const q = questions[current];
    const opt = q.options.find((o) => o.id === optionId);
    if (!opt) return;

    const newScores = { ...scores };
    for (const key of TRAIT_KEYS) {
      newScores[key] += opt[`trait_${key}` as keyof Option] as number;
    }
    setScores(newScores);
    setAnswers([...answers, opt]);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Filter saints by selected gender, then match
      const filtered = saints.filter((s) => s.gender === gender);
      const pool = filtered.length > 0 ? filtered : saints;
      const matched = matchSaint(newScores, pool);
      setResult(matched);
      saveQuizResult({ version: 1, slug: matched.slug, gender: gender ?? "Male", scores: newScores });
      track("quiz_complete", { saint_slug: matched.slug });
      // Best-effort analytics; never let a backend outage break the result
      // screen. quiz_results.saint_id is a FK to the backend's saints table,
      // so log with the DB UUID and skip saints the DB doesn't have yet.
      const dbId = (saintDbIds as Record<string, string>)[matched.slug];
      if (dbId) {
        try {
          void getInsforgePublic().database
            .from("quiz_results")
            .insert([{ saint_id: dbId, scores: newScores }]);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleBack = () => {
    if (current === 0) {
      // Back from the first trait question returns to the gender step.
      setGender(null);
      return;
    }
    const lastAnswer = answers[answers.length - 1];
    const newScores = { ...scores };
    for (const key of TRAIT_KEYS) {
      newScores[key] -= lastAnswer[`trait_${key}` as keyof Option] as number;
    }
    setScores(newScores);
    setAnswers(answers.slice(0, -1));
    setCurrent(current - 1);
  };

  const displayedResult = result ?? (saved ? saints.find(saint => saint.slug === saved.slug) : null);
  if (displayedResult) {
    const displayedScores = result ? scores : saved!.scores;
    const displayedGender = result ? gender : saved!.gender;
    return <Result saint={displayedResult} scores={displayedScores} relatedSaints={moreQuizSaints(displayedScores, saints.filter(saint => saint.gender === displayedGender), displayedResult.slug)} onRestart={() => { saveQuizResult(null); onRestart(); }} />;
  }

  return (
    <div className="quiz-shell">
      <ProgressBar current={currentStep} total={totalSteps} />
      {gender === null ? (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="question-card" aria-labelledby="gender-heading">
          <p className="eyebrow">Let’s start with you</p>
          <h1 ref={genderHeading} tabIndex={-1} id="gender-heading" className="question-title outline-none">What is your gender?</h1>
          <p className="text-cream-dark text-sm leading-relaxed mb-6">This helps us match you with a saint of the same gender.</p>
          <div className="question-options"><OptionButton label="Male" index={0} onSelect={() => handleGenderSelect("Male")} /><OptionButton label="Female" index={1} onSelect={() => handleGenderSelect("Female")} /></div>
        </motion.section>
      ) : <QuestionCard key={questions[current].id} question={questions[current]} onSelect={handleSelect} />}
      <button type="button" onClick={gender === null ? onExit : handleBack} className="quiz-back">← {gender === null ? "Back to discovery" : "Previous question"}</button>
      <p className="quiz-hint">No right or wrong answers. Choose what feels most like you.</p>
    </div>
  );
}
