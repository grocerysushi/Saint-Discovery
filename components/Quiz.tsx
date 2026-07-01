"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { Saint, QuestionWithOptions, Option, TraitScores, TRAIT_KEYS } from "@/lib/types";
import { matchSaint } from "@/lib/scoring";
import quizData from "@/lib/data/quiz.json";
import quizSaints from "@/lib/data/quiz-saints.json";
import saintDbIds from "@/lib/data/saint-db-ids.json";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import OptionButton from "./OptionButton";
import Result from "./Result";

// Quiz content ships with the bundle (lib/data/*.json) so the quiz works even
// if the backend is unreachable; only result logging touches the network.
const QUESTIONS: QuestionWithOptions[] = quizData.questions.map((q) => ({
  ...q,
  options: (quizData.options as Option[]).filter(
    (o) => o.question_id === q.id
  ),
}));
const SAINTS = quizSaints as Saint[];

export default function Quiz({ onRestart }: { onRestart: () => void }) {
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
  const [result, setResult] = useState<Saint | null>(null);

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

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Filter saints by selected gender, then match
      const filtered = saints.filter((s) => s.gender === gender);
      const pool = filtered.length > 0 ? filtered : saints;
      const matched = matchSaint(newScores, pool);
      setResult(matched);
      // Best-effort analytics; never let a backend outage break the result
      // screen. quiz_results.saint_id is a FK to the backend's saints table,
      // so log with the DB UUID and skip saints the DB doesn't have yet.
      const dbId = (saintDbIds as Record<string, string>)[matched.slug];
      if (dbId) {
        try {
          void insforge.database
            .from("quiz_results")
            .insert([{ saint_id: dbId, scores: newScores }]);
        } catch {
          // ignore
        }
      }
    }
  };

  if (result) {
    return <Result saint={result} scores={scores} onRestart={onRestart} />;
  }

  // Gender question (step 0)
  if (gender === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <AnimatePresence mode="wait">
          <motion.div
            key="gender-question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-semibold text-cream mb-8 text-center leading-relaxed">
              What is your gender?
            </h2>
            <div className="flex flex-col gap-3">
              <OptionButton label="Male" index={0} onSelect={() => handleGenderSelect("Male")} />
              <OptionButton label="Female" index={1} onSelect={() => handleGenderSelect("Female")} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Trait questions (steps 1+)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <ProgressBar current={currentStep} total={totalSteps} />
      <AnimatePresence mode="wait">
        <QuestionCard
          key={questions[current].id}
          question={questions[current]}
          onSelect={handleSelect}
        />
      </AnimatePresence>
    </div>
  );
}
