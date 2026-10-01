"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { QuestionWithOptions } from "@/lib/types";
import OptionButton from "./OptionButton";
export default function QuestionCard({ question, onSelect }: { question: QuestionWithOptions; onSelect: (optionId: string) => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [question.id]);
  return <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }} className="question-card" aria-labelledby="question-heading">
    <p className="eyebrow">Take a moment to reflect</p>
    <h1 id="question-heading" ref={heading} tabIndex={-1} className="question-title outline-none">{question.text}</h1>
    <div className="question-options">{question.options.map((opt,i) => <OptionButton key={opt.id} label={opt.label} citation={opt.source ? `${opt.source.label}, NABRE` : undefined} index={i} onSelect={() => onSelect(opt.id)} />)}</div>
    {question.options.some(option => option.source) && <p className="text-cream-dark text-sm leading-relaxed mt-4">Brief excerpts from the New American Bible, Revised Edition (NABRE). Read in context: {question.options.filter(option => option.source).map((option, index) => <span key={option.id}>{index > 0 && " · "}<a href={option.source!.url} target="_blank" rel="noopener noreferrer" className="text-link">{option.source!.label}<span className="sr-only"> (opens in a new tab)</span></a></span>)}</p>}
  </motion.section>;
}
