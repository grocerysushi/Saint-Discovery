import type { ReactNode } from "react";

// Shared presentational shell for the email-flow pages (confirm / subscribed /
// unsubscribe / unsubscribed). Server component — no client JS.
export default function EmailFlowCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-5xl mb-5" aria-hidden>
          {"✨"}
        </div>
        {eyebrow ? (
          <p className="text-gold tracking-[0.2em] uppercase text-xs mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-cream mb-5 leading-tight">
          {title}
        </h1>
        <div className="text-cream-dark leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </main>
  );
}
