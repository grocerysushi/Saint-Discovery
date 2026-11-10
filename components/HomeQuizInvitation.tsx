"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuizSession } from "@/components/useQuizSession";

export default function HomeQuizInvitation() {
  const saved = useQuizSession();
  return (
    <Button variant="gold" size="cta" className="home-invitation-button" nativeButton={false} render={<Link href="/quiz" prefetch={false}>
        {saved ? "Return to my saint match" : "Take the saint quiz"}<span aria-hidden>↗</span>
      </Link>} />
  );
}
