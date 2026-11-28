import type { Metadata } from "next";
import Link from "next/link";
import QuizExperience from "@/components/QuizExperience";
import { getQuizCandidates } from "@/lib/quiz-candidates";
import { absoluteUrl, quizJsonLd, serializeJsonLd, socialMetadata } from "@/lib/seo";
import quiz from "@/lib/data/quiz.json";
import "@/app/quiz.css";

export const metadata: Metadata = {
  title: "Catholic Saint Quiz: Find Your Saint",
  description: "Take the Catholic saint quiz to discover a saint whose life reflects your answers, then explore their story and other saint biographies.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/quiz" },
  ...socialMetadata("Catholic Saint Quiz: Find Your Saint", "Take the Catholic saint quiz and discover a saint whose life you can explore.", "/quiz"),
};

const QUESTION_COUNT = (Array.isArray(quiz) ? quiz : (quiz as { questions: unknown[] }).questions).length;

export default function QuizPage() {
  const candidates = getQuizCandidates().length;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Catholic Saint Quiz", item: absoluteUrl("/quiz") },
    ],
  };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(quizJsonLd()) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
    <QuizExperience />
    <section aria-labelledby="quiz-about-title" className="site-width quiz-about mt-16 mb-16 max-w-3xl space-y-4 text-cream-dark leading-relaxed [&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:text-cream [&_h2]:pt-2 [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
      <h2 id="quiz-about-title">How the Catholic saint quiz works</h2>
      <p>
        The quiz starts by asking whether to match you with a male or female saint. Then {QUESTION_COUNT} short
        questions ask how you pray, help others, face difficulty and spend quiet time. Each answer adds to six traits: contemplative,
        charitable, intellectual, courageous, joyful and mystical.
      </p>
      <p>
        Your result is the saint, among {candidates} with reviewed biographies, whose traits are closest to
        yours. It is a starting point for reading about a real life of faith, not a verdict on who you are. No
        account is needed, and your answers stay in your browser.
      </p>
      <h2>After your result</h2>
      <p>
        Your saint’s page tells their story with sources, along with their feast day and a prayer where one is
        recorded. You can also explore other saints whose traits are close to yours.
      </p>
      <ul>
        <li><Link prefetch={false} href="/resources">Browse all saint biographies</Link></li>
        <li><Link prefetch={false} href="/feast-days">See feast days by month</Link></li>
        <li><Link prefetch={false} href="/patron-saint-of">Find a patron saint</Link></li>
        <li><Link prefetch={false} href="/confirmation-saint-guide">Choose a Confirmation saint</Link></li>
      </ul>
    </section>
  </main>;
}
