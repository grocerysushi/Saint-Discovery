"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Quiz from "./Quiz";

export default function QuizExperience() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);

  return <Quiz key={attempt} onRestart={() => setAttempt(value => value + 1)} onExit={() => router.push("/")} />;
}
