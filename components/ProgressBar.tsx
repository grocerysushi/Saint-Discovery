"use client";
import { motion } from "framer-motion";
export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = (current / total) * 100;
  return <div className="quiz-progress">
    <div className="quiz-progress-label"><span>YOUR SAINT DISCOVERY</span><span>Question <strong className="text-cream">{String(current + 1).padStart(2, "0")}</strong> / {total}</span></div>
    <div className="quiz-progress-track" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-valuetext={`${current} of ${total} questions answered`}><motion.div className="quiz-progress-fill" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: .3 }} /></div>
  </div>;
}
