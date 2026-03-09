"use client";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { Saint, QuestionWithOptions, Option, TraitScores, TRAIT_KEYS } from "@/lib/types";
import { matchSaint } from "@/lib/scoring";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import Result from "./Result";

export default function Quiz({ onRestart }: { onRestart: () => void }) {
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [saints, setSaints] = useState<Saint[]>([]);
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [qRes, oRes, sRes] = await Promise.all([
        insforge.database.from("questions").select().order("sort_order", { ascending: true }),
        insforge.database.from("options").select(),
        insforge.database.from("saints").select(),
      ]);

      const qs = (qRes.data || []) as QuestionWithOptions[];
      const opts = (oRes.data || []) as Option[];
      const ss = (sRes.data || []) as Saint[];

      for (const q of qs) {
        q.options = opts.filter((o) => o.question_id === q.id);
      }

      setQuestions(qs);
      setSaints(ss);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = async (optionId: string) => {
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
      const matched = matchSaint(newScores, saints);
      setResult(matched);
      // Save result to DB
      await insforge.database.from("quiz_results").insert([
        { saint_id: matched.id, scores: newScores },
      ]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold/60 animate-pulse text-lg">Loading your journey...</div>
      </div>
    );
  }

  if (result) {
    return <Result saint={result} scores={scores} onRestart={onRestart} />;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-cream-dark">No questions found. Please seed the database.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <ProgressBar current={current} total={questions.length} />
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
