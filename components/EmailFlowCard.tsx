import type { ReactNode } from "react";
export default function EmailFlowCard({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return <main className="email-flow"><div className="email-flow-card"><span className="brand-mark mx-auto mb-7" aria-hidden>✦</span>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><div className="text-cream-dark leading-relaxed space-y-4">{children}</div></div></main>;
}
