"use client";
import { motion } from "framer-motion";

export default function OptionButton({
  label,
  index,
  onSelect,
}: {
  label: string;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.3 }}
      whileHover={{ x: 8, backgroundColor: "rgba(212, 165, 116, 0.15)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="w-full text-left p-4 rounded-xl border border-navy-lighter
                 hover:border-gold/50 transition-colors duration-200 cursor-pointer
                 text-cream/90 hover:text-cream"
    >
      <span className="text-gold/60 mr-3 font-mono text-sm">
        {String.fromCharCode(65 + index)}.
      </span>
      {label}
    </motion.button>
  );
}
