"use client";
import { motion } from "framer-motion";
import { QuestionWithOptions } from "@/lib/types";
import OptionButton from "./OptionButton";

export default function QuestionCard({
  question,
  onSelect,
}: {
  question: QuestionWithOptions;
  onSelect: (optionId: string) => void;
}) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <h2 className="text-2xl md:text-3xl font-heading font-semibold text-cream mb-8 text-center leading-relaxed">
        {question.text}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <OptionButton
            key={opt.id}
            label={opt.label}
            index={i}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}
