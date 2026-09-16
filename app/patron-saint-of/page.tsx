import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig, serializeJsonLd } from "@/lib/seo";
import { PATRON_TOPICS, titleCaseLabel } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Patron Saints by Cause and Guides for Everyday Life",
  description:
    "Explore sourced saint guides for blacksmiths, nurses, parents, students, grief, and difficult decisions, alongside an A-to-Z patron saint directory.",
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
      "Explore patronages A to Z and sourced guides to saints for everyday life.",
    url: absoluteUrl("/patron-saint-of"),
    siteName: siteConfig.name,
    type: "website",
  },
};

// Editorial shortcuts, not a ranking of Search Console query volumes.
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 site-width directory-page">
        <header className="page-intro">
          <p className="eyebrow mb-3">
            Saint Discovery
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-5 leading-tight">
            Patron Saints by Cause
          </h1>
          <p className="text-cream-dark leading-relaxed max-w-2xl">
            Find saints connected with work, family life, and the challenges
            you face. Start with a sourced guide, or browse {PATRON_TOPICS.length}{" "}
            patronage topics. The guides explain the difference between
            documented patronage and a saint offered as a spiritual companion.
          </p>
        </header>

        <section className="mb-12" aria-labelledby="life-guides">
          <h2 id="life-guides" className="font-heading text-3xl text-cream mb-5">Saints for everyday life</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PATRON_GUIDES.map(guide => <Link key={guide.slug} href={`/patron-saint-of/${guide.slug}`} className="block p-6 rounded-xl border border-navy-lighter bg-navy-light/40 hover:border-gold transition-colors">
              <h3 className="font-heading text-xl text-cream mb-3">{guide.label} <span aria-hidden="true">→</span></h3>
              <p className="text-sm text-cream-dark leading-relaxed">{guide.description}</p>
            </Link>)}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xs text-gold/70 uppercase tracking-wider mb-4">
            Explore patronages
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
          <section key={letter} className="patron-letter-group">
            <h2 className="text-gold font-heading text-2xl mb-3">{letter}</h2>
            <div className="patron-links">
              {groups.get(letter)!.map((t) => (
                <Link
                  key={t.slug}
                  href={`/patron-saint-of/${t.slug}`}
                  className="text-sm text-cream-dark hover:text-gold transition-colors"
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
            href="/quiz"
            className="inline-block px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-gold-light transition-colors"
          >
            Take the Saint Quiz
          </Link>
        </section>
      </div>
    </main>
  );
}
