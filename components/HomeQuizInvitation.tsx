"use client";

import Link from "next/link";
import { useQuizSession } from "@/components/useQuizSession";

export default function HomeQuizInvitation() {
  const saved = useQuizSession();
  return <Link href="/quiz" prefetch={false} className="home-invitation-button">{saved ? "Return to my saint match" : "Take the saint quiz"}<span aria-hidden>↗</span></Link>;
}
