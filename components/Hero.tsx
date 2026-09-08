"use client";
import DailySaintCard from "./DailySaintCard";
import type { DailySaint } from "@/lib/saint-of-day";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero({ dailySaint }: { dailySaint: DailySaint | null }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="home-hero">
      <div className="site-width">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker">A little reflection. A lasting connection.</p>
            <h1 className="hero-title">Which Catholic<br />saint <em>are you?</em></h1>
            <p className="hero-description">Discover the saint who shares your spirit. A few thoughtful questions can introduce you to a lifetime of inspiration.</p>
            <div className="hero-actions">
              <Link href="/quiz" className="btn-primary">Find my saint <span className="arrow" aria-hidden>↗</span></Link>
              <Link href="/resources" className="text-link">Explore the saints <span aria-hidden>→</span></Link>
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
