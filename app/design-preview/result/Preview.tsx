"use client";
import Result from "@/components/Result";
import type { Saint, TraitScores } from "@/lib/types";

export default function Preview(props: { saint: Saint; scores: TraitScores; relatedSaints: Saint[] }) {
  return <Result {...props} onRestart={() => window.location.assign("/quiz")} />;
}
