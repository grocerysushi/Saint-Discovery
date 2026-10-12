"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Quiz from "./Quiz";
import { isTranslationProxy, proxyNavigationUrl } from "@/lib/site-languages";

export default function QuizExperience() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);

  return <Quiz key={attempt} onRestart={() => setAttempt(value => value + 1)} onExit={() => {
    if (isTranslationProxy(window.location.hostname)) {
      const language = new URLSearchParams(window.location.search).get("_x_tr_tl") ?? "";
      window.location.assign(proxyNavigationUrl("/", language) ?? "https://www.saintdiscoveryquiz.com/");
    } else router.push("/");
  }} />;
}
