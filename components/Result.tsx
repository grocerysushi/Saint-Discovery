"use client";
import { motion } from "framer-motion";
import { Saint, TraitScores, TRAIT_KEYS } from "@/lib/types";

export default function Result({
  saint,
  scores,
  onRestart,
}: {
  saint: Saint;
  scores: TraitScores;
  onRestart: () => void;
}) {
  const maxScore = Math.max(...TRAIT_KEYS.map((k) => scores[k]), 1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-6 py-16"
    >
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-7xl mb-4"
        >
          {"\u2728"}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gold tracking-[0.2em] uppercase text-sm mb-2"
        >
          Your Saint Match
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-heading font-bold text-cream mb-3"
        >
          {saint.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gold-light text-lg italic mb-6"
        >
          &ldquo;{saint.tagline}&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-cream-dark leading-relaxed mb-8"
        >
          {saint.description}
        </motion.p>

        {saint.feast_day && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-cream-dark/60 text-sm mb-6"
          >
            Feast Day: {saint.feast_day}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-navy-light rounded-2xl p-6 mb-8"
        >
          <p className="text-sm text-cream-dark mb-4 uppercase tracking-wider">
            Your Trait Profile
          </p>
          <div className="space-y-3">
            {TRAIT_KEYS.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-cream/60 text-xs w-24 text-right capitalize">
                  {key}
                </span>
                <div className="flex-1 h-2 bg-navy-lighter rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(scores[key] / maxScore) * 100}%` }}
                    transition={{ delay: 0.9 + i * 0.05, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {saint.prayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-navy-light/50 rounded-xl p-5 mb-8 border border-navy-lighter"
          >
            <p className="text-xs text-gold/60 uppercase tracking-wider mb-2">
              Prayer
            </p>
            <p className="text-cream-dark text-sm italic leading-relaxed">
              {saint.prayer}
            </p>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="mt-6 px-8 py-3 border border-gold/30 text-gold rounded-full
                     hover:bg-gold/10 transition-colors cursor-pointer"
        >
          Take Again
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-8"
        >
          <a
            href="/resources"
            className="text-gold/50 hover:text-gold text-sm transition-colors underline underline-offset-4"
          >
            Explore Resources &amp; All Saints
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
