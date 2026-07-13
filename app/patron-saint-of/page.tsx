import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { PATRON_TOPICS, titleCaseLabel } from "@/lib/patronage";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Patron Saints by Cause — Find the Patron Saint of Anything",
  description:
    "Browse 700+ Catholic patronages A to Z — from travelers and nurses to lost causes and anxiety — and find which saint to ask for intercession.",
  keywords: [
    "patron saint of",
    "patron saints list",
    "patron saints by profession",
    "patron saint finder",
    "which saint to pray to",
  ],
  alternates: { canonical: "/patron-saint-of" },
  openGraph: {
    title: "Patron Saints by Cause | Saint Discovery",
    description:
      "Browse 700+ Catholic patronages A to Z and find which saint to ask for intercession.",
    url: absoluteUrl("/patron-saint-of"),
    siteName: siteConfig.name,
    type: "website",
  },
};

// The topics people actually search for, surfaced above the A–Z wall.
const FEATURED_SLUGS = [
  "travelers",
  "the-sick",
  "lost-causes",
  "anxiety",
  "mental-illness",
  "students",
  "nurses",
  "expectant-mothers",
  "animals",
  "musicians",
  "soldiers",
  "the-poor",
];

export default function PatronIndexPage() {
  const featured = FEATURED_SLUGS.map((slug) =>
    PATRON_TOPICS.find((t) => t.slug === slug)
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const groups = new Map<string, typeof PATRON_TOPICS>();
  for (const topic of PATRON_TOPICS) {
    // Group by first letter of the meaningful word ("the sick" files under S).
    const word =
      topic.label
        .toLowerCase()
        .replace(/^(the|a|an|against)\s+/, "")
        .charAt(0)
        .toUpperCase() || "#";
    const letter = /[A-Z]/.test(word) ? word : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(topic);
  }
  const letters = [...groups.keys()].sort();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      {
        "@type": "ListItem",
        position: 2,
        name: "Patron Saints",
        item: absoluteUrl("/patron-saint-of"),
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <p className="text-gold tracking-[0.25em] uppercase text-xs mb-3">
            Saint Discovery
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-5 leading-tight">
            Patron Saints by Cause
          </h1>
          <p className="text-cream-dark leading-relaxed">
            For nearly every profession, place, illness, and struggle, the
            Church has a patron — a saint whose own life touched that corner of
            human experience and who is asked to pray for those living it now.
            Browse {PATRON_TOPICS.length} patronages below, or start with the
            ones people look for most.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-xs text-gold/70 uppercase tracking-wider mb-4">
            Most searched
          </h2>
          <div className="flex flex-wrap gap-2">
            {featured.map((t) => (
              <Link
                key={t.slug}
                href={`/patron-saint-of/${t.slug}`}
                className="px-4 py-2 rounded-full bg-navy-light border border-navy-lighter
                           text-cream-dark hover:border-gold/40 hover:text-gold transition-colors"
              >
                {titleCaseLabel(t.label)}
              </Link>
            ))}
          </div>
        </section>

        {letters.map((letter) => (
          <section key={letter} className="mb-8">
            <h2 className="text-gold font-heading text-2xl mb-3">{letter}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {groups.get(letter)!.map((t) => (
                <Link
                  key={t.slug}
                  href={`/patron-saint-of/${t.slug}`}
                  className="text-sm text-cream-dark/80 hover:text-gold transition-colors"
                >
                  {titleCaseLabel(t.label)}
                  {t.saints.length > 1 && (
                    <span className="text-cream-dark/40"> ({t.saints.length})</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-12 pt-8 border-t border-navy-lighter">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-gold-light transition-colors"
          >
            Take the Saint Quiz
          </Link>
        </section>
      </div>
    </main>
  );
}
