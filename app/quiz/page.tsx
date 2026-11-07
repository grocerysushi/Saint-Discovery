import type { Metadata } from "next";
import QuizExperience from "@/components/QuizExperience";
import { socialMetadata } from "@/lib/seo";
import "@/app/encounter-preview.css";
import "@/app/reading-room.css";
import "@/app/quiz-reading.css";

export const metadata: Metadata = {
  title: "Find Your Saint",
  robots: { index: false, follow: true },
  alternates: { canonical: "/quiz" },
  ...socialMetadata("Find Your Saint", "Discover a Catholic saint whose story you can explore.", "/quiz"),
};

export default function QuizPage() {
  return <main><QuizExperience /></main>;
}
