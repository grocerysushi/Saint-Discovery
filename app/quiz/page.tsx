import type { Metadata } from "next";
import QuizExperience from "@/components/QuizExperience";
import { getQuizCandidates } from "@/lib/quiz-candidates";

export const metadata: Metadata = {
  title: "Find Your Saint",
  robots: { index: false, follow: true },
};

export default function QuizPage() {
  return <main><QuizExperience saints={getQuizCandidates()} /></main>;
}
