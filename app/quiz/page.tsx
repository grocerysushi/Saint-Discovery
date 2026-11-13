import type { Metadata } from "next";
import QuizExperience from "@/components/QuizExperience";
import { socialMetadata } from "@/lib/seo";
import "@/app/encounter-preview.css";
import "@/app/reading-room.css";
import "@/app/quiz-reading.css";

export const metadata: Metadata = {
  title: "Catholic Saint Quiz: Find Your Saint",
  description: "Take the Catholic saint quiz to discover a saint whose life reflects your answers, then explore their story and other saint biographies.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/quiz" },
  ...socialMetadata("Catholic Saint Quiz: Find Your Saint", "Take the Catholic saint quiz and discover a saint whose life you can explore.", "/quiz"),
};

export default function QuizPage() {
  return <main><QuizExperience /></main>;
}
