"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Hero from "@/components/Hero";
import Quiz from "@/components/Quiz";
import { track } from "@/lib/analytics";
import posthog from "posthog-js";

type Screen = "hero" | "quiz";

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("hero");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {screen === "hero" ? (
            <Hero
              key="hero"
              onStart={() => {
                track("quiz_start");
                posthog.capture("quiz_start");
                setScreen("quiz");
              }}
            />
          ) : (
            <Quiz key="quiz" onRestart={() => setScreen("hero")} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
