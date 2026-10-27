"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Quiz from "./Quiz";
import { isTranslationProxy, proxyNavigationUrl } from "@/lib/site-languages";
import type { Saint } from "@/lib/types";

export default function QuizExperience() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [saints, setSaints] = useState<Saint[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/quiz/candidates", { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Quiz data unavailable"); return response.json(); })
      .then(data => { if (!Array.isArray(data) || data.length === 0) throw new Error("Invalid quiz data"); setSaints(data); setLoadError(false); })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [loadAttempt]);

  if (!saints) return <div className="site-width quiz-shell"><div className="question-card" role={loadError ? "alert" : "status"}><h1 className="question-title">{loadError ? "The quiz could not load" : "Getting your quiz ready"}</h1><p>{loadError ? "Check your connection and try again. Your saved progress remains in this browser tab." : "Preparing the saint stories for your quiz."}</p>{loadError && <button type="button" className="btn-primary mt-5" onClick={() => { setLoadError(false); setLoadAttempt(value => value + 1); }}>Try again</button>}</div></div>;

  return <Quiz key={attempt} saints={saints} onRestart={() => setAttempt(value => value + 1)} onExit={() => {
    if (isTranslationProxy(window.location.hostname)) {
      const language = new URLSearchParams(window.location.search).get("_x_tr_tl") ?? "";
      window.location.assign(proxyNavigationUrl("/", language) ?? "https://www.saintdiscoveryquiz.com/");
    } else router.push("/");
  }} />;
}
