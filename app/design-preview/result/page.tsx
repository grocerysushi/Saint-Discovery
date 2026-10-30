import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizCandidates } from "@/lib/quiz-candidates";
import { moreQuizSaints } from "@/lib/quiz-results";
import Preview from "./Preview";

export const metadata: Metadata = { title: "Result design preview", robots: { index: false, follow: false } };

export default function ResultDesignPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const saints = getQuizCandidates();
  const saint = saints.find(item => item.slug === "teresa-of-avila")!;
  const scores = { contemplative: 42, charitable: 18, intellectual: 31, courageous: 32, joyful: 33, mystical: 30 };
  return <main><p className="site-width" style={{ fontSize: 13, marginTop: 14 }}>Design preview · Example result and illustrative scores, not your quiz result.</p><Preview saint={saint} scores={scores} relatedSaints={moreQuizSaints(scores, saints.filter(item => item.gender === "Female"), saint.slug)} /></main>;
}
