"use client";
import { motion } from "framer-motion";

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <p className="text-gold text-lg tracking-[0.3em] uppercase mb-4 font-body">
          A Journey of Faith
        </p>
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-cream mb-6 leading-tight">
          Which Catholic Saint
          <br />
          <span className="text-gold">Are You?</span>
        </h1>
        <p className="text-cream text-base md:text-lg max-w-xl mx-auto mb-4 font-medium">
          Free Catholic personality quiz &middot; 480+ saints &middot; 21
          questions
        </p>
        <p className="text-cream-dark text-lg md:text-xl max-w-xl mx-auto mb-12 font-light">
          Answer 21 questions to discover the saint who shares your spiritual
          gifts and calling.
        </p>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="px-10 py-4 bg-gold text-navy font-semibold text-lg rounded-full
                   hover:bg-gold-light transition-colors duration-300 cursor-pointer"
      >
        Begin the Journey
      </motion.button>

      <motion.a
        href="/resources"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className="mt-4 px-8 py-3 border border-gold/30 text-gold rounded-full
                   hover:bg-gold/10 transition-colors cursor-pointer"
      >
        Explore Resources &amp; All Saints
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-center text-cream-dark text-sm"
      >
        480+ Saints &middot; 6 Virtues &middot; 1 Match
      </motion.div>
    </motion.div>
  );
}
