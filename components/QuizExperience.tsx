"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Quiz from "./Quiz";
import { track } from "@/lib/analytics";

export default function QuizExperience() {
  const router = useRouter();
  const started = useRef(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track("quiz_start");
  }, []);

  return <Quiz key={attempt} onRestart={() => setAttempt(value => value + 1)} onExit={() => router.push("/")} />;
}
