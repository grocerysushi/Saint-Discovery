import type { Metadata } from "next";
import QuizExperience from "@/components/QuizExperience";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Find Your Saint",
  robots: { index: false, follow: true },
  alternates: { canonical: "/quiz" },
  ...socialMetadata("Find Your Saint", "Discover a Catholic saint whose story you can explore.", "/quiz"),
};

export default function QuizPage() {
  return <main><QuizExperience /></main>;
}
