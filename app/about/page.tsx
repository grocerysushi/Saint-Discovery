import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";

export const metadata: Metadata = {
  title: "About Saint Discovery",
  description:
    "Saint Discovery is a free Catholic saint personality quiz and a directory of 480+ saints — biographies, feast days, patronages, and prayers.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Saint Discovery",
    description:
      "A free Catholic saint personality quiz and a directory of 480+ saints.",
    url: absoluteUrl("/about"),
    siteName: siteConfig.name,
    type: "website",
  },
};

const CONTACT_EMAIL = "hello@saintdiscoveryquiz.com";

export default async function AboutPage() {
  const saintCount = (await getAllSaints().catch(() => [])).length;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <p className="text-gold tracking-[0.25em] uppercase text-xs mb-3">
            Saint Discovery
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4 leading-tight">
            About Saint Discovery
          </h1>
        </header>

        <div className="text-cream-dark leading-relaxed space-y-5">
          <p>
            Saint Discovery began with a simple idea: the saints are not
            marble statues — they were real people with distinct personalities,
            struggles, and gifts, and every one of us has more in common with
            some of them than we might guess. The quiz matches your answers
            against six spiritual traits — contemplative, charitable,
            intellectual, courageous, joyful, and mystical — and pairs you with
            the saint whose life most resembles your own temperament.
          </p>
          <p>
            Behind the quiz sits a growing directory of{" "}
            {saintCount > 0 ? `${saintCount} ` : ""}Catholic saints, each with a
            biography, feast day, patronages, quotes, and a prayer. Whether you
            arrived here looking for a confirmation saint, the patron of your
            profession, or just five minutes of fun that turns into a friendship
            with someone who ran the race before you — welcome.
          </p>
          <p>
            The quiz is free, requires no account, and always will. If you want
            to take your result with you, you can have it emailed along with a
            short novena — see our{" "}
            <Link
              href="/privacy"
              className="text-gold hover:text-gold-light underline"
            >
              privacy policy
            </Link>{" "}
            for exactly how that works.
          </p>
          <p>
            Questions, corrections, or saint suggestions:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-gold hover:text-gold-light underline"
            >
              {CONTACT_EMAIL}
            </a>
            . Corrections are especially welcome — hagiography is a field where
            legend and history intertwine, and we do our best to be honest about
            the difference.
          </p>
        </div>

        <section className="mt-12 pt-8 border-t border-navy-lighter flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-gold text-navy font-semibold rounded-full text-center hover:bg-gold-light transition-colors"
          >
            Take the Saint Quiz
          </Link>
          <Link
            href="/resources"
            className="px-6 py-3 border border-gold/40 text-gold rounded-full text-center hover:bg-gold/10 transition-colors"
          >
            Browse All Saints
          </Link>
        </section>
      </div>
    </main>
  );
}
