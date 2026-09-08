"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Quiz from "./Quiz";
import { track } from "@/lib/analytics";

export default function QuizExperience() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track("quiz_start");
  }, []);

  return <Quiz onRestart={() => router.push("/")} />;
}
