"use client";
export default function OptionButton({ label, citation, index, onSelect }: { label: string; citation?: string; index: number; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className="option-button"><span className="option-key" aria-hidden>{String.fromCharCode(65 + index)}</span><span><span className="block">{label}</span>{citation && <span className="block text-cream-dark text-sm leading-relaxed mt-1">{citation}</span>}</span><span className="option-arrow" aria-hidden>→</span></button>;
}
