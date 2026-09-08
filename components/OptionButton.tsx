"use client";
export default function OptionButton({ label, index, onSelect }: { label: string; index: number; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className="option-button"><span className="option-key" aria-hidden>{String.fromCharCode(65 + index)}</span><span>{label}</span><span className="option-arrow" aria-hidden>→</span></button>;
}
