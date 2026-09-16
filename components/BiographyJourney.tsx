"use client";
import Link from "next/link";
import { useQuizSession } from "./useQuizSession";

export default function BiographyJourney({ slug }: { slug: string }) {
  const saved = useQuizSession();
  if (!saved) return null;
  return <aside className="biography-journey" aria-label="Your quiz journey"><div><p className="eyebrow">{saved.slug === slug ? "Meet your saint match" : "Keep exploring your match"}</p><p>{saved.slug === slug ? "Go beyond the match. Read the life, notice what speaks to you, and choose one idea to carry with you." : "You’re exploring another life. Your quiz result is still available when you’re ready to return."}</p></div><Link href="/quiz" className="btn-secondary">← Back to my result</Link></aside>;
}
