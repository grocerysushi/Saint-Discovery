import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-xl mx-auto px-6 py-32 text-center">
        <p className="text-gold tracking-[0.25em] uppercase text-xs mb-4">
          404
        </p>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-6">
          Page Not Found
        </h1>
        <p className="text-cream-dark leading-relaxed mb-10">
          The page you are looking for has wandered off. Take the saint quiz or
          browse the full directory of Catholic saints instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-gold-light transition-colors"
          >
            Take the Saint Quiz
          </Link>
          <Link
            href="/resources"
            className="px-8 py-3 border border-gold/40 text-gold rounded-full hover:bg-gold/10 transition-colors"
          >
            Browse All Saints
          </Link>
        </div>
      </div>
    </main>
  );
}
