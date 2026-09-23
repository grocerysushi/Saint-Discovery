"use client";
import DailySaintCard from "./DailySaintCard";
import type { DailySaint } from "@/lib/saint-of-day";
import Link from "next/link";
import { motion } from "framer-motion";
import { track } from "@/lib/analytics";

export default function Hero({ dailySaint }: { dailySaint: DailySaint | null }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="home-hero">
      <div className="site-width">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker">Free Catholic saint quiz</p>
            <h1 className="hero-title">Which Catholic<br />saint <em>are you?</em></h1>
            <p className="hero-description">Take a short quiz to discover a Catholic saint whose virtues connect with your answers. Then explore their story, feast day, and a prayer.</p>
            <div className="hero-actions">
              <Link href="/quiz" onClick={() => track("homepage_quiz_click", { link_placement: "home_hero", content_version: "clear_intro_v1" })} className="btn-primary">Take the free quiz <span className="arrow" aria-hidden>↗</span></Link>
              <Link href="/resources" onClick={() => track("homepage_directory_click", { link_placement: "home_hero", content_version: "clear_intro_v1" })} className="text-link">Browse saint biographies <span aria-hidden>→</span></Link>
            </div>
            <p className="hero-note"><span aria-hidden>✓</span> Free to explore · 3–5 minutes · No account needed</p>
          </div>
          <DailySaintCard initialSaint={dailySaint} />
        </div>
        <div className="hero-facts" aria-label="About the quiz">
          <div className="hero-fact"><strong>480+</strong><span>saints to discover</span></div>
          <div className="hero-fact"><strong>6</strong><span>spiritual traits</span></div>
          <div className="hero-fact"><strong>21</strong><span>questions to your match</span></div>
        </div>
      </div>
    </motion.div>
  );
}
