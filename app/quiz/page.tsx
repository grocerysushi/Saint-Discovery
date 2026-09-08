import type { Metadata } from "next";
import QuizExperience from "@/components/QuizExperience";

export const metadata: Metadata = {
  title: "Find Your Saint",
  robots: { index: false, follow: true },
};

export default function QuizPage() {
  return <main><QuizExperience /></main>;
}
