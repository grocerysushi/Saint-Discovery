import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSaints } from "@/lib/saints";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import {
  PATRON_TOPICS,
  getTopicBySlug,
  titleCaseLabel,
  topicTitle,
} from "@/lib/patronage";

export const revalidate = 86400;

export function generateStaticParams() {
  return PATRON_TOPICS.map((t) => ({ topic: t.slug }));
}

type Params = { topic: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { topic: topicSlug } = await params;
  const topic = getTopicBySlug(topicSlug);
  if (!topic) return { title: "Patronage Not Found" };

  const saints = await getSaintsForTopic(topic.saints);
  const names = saints.slice(0, 3).map((s) => `St. ${s.name}`);
  const title = topicTitle(topic);
  const description =
    saints.length === 1
      ? `${names[0]} is the ${title.toLowerCase()}. Learn why, read the biography, feast day, and a prayer for their intercession.`
      : `${names.join(", ")}${saints.length > 3 ? ` and ${saints.length - 3} more` : ""} are venerated as ${title.toLowerCase()}. Feast days, biographies, and prayers.`;

  const url = absoluteUrl(`/patron-saint-of/${topic.slug}`);
  return {
    title,
    description,
    alternates: { canonical: `/patron-saint-of/${topic.slug}` },
    openGraph: {
      title: `${title} | Saint Discovery`,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

async function getSaintsForTopic(slugs: string[]) {
  const all = await getAllSaints();
  const bySlug = new Map(all.map((s) => [s.slug, s]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
}

export default async function PatronTopicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic: topicSlug } = await params;
  const topic = getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const saints = await getSaintsForTopic(topic.saints);
  if (saints.length === 0) notFound();

  const title = topicTitle(topic);
  const url = absoluteUrl(`/patron-saint-of/${topic.slug}`);
  const displayLabel = titleCaseLabel(topic.label);

  // Topics that share at least one saint with this one — the internal mesh.
  const saintSet = new Set(topic.saints);
  const related = PATRON_TOPICS.filter(
    (t) => t.slug !== topic.slug && t.saints.some((s) => saintSet.has(s))
  ).slice(0, 8);

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
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    url,
    numberOfItems: saints.length,
    itemListElement: saints.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `St. ${s.name}`,
      url: absoluteUrl(`/saints/${s.slug}`),
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-gold/60 mb-8 flex flex-wrap gap-2"
        >
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link
            href="/patron-saint-of"
            className="hover:text-gold transition-colors"
          >
            Patron Saints
          </Link>
          <span aria-hidden>/</span>
          <span className="text-cream-dark/70">{displayLabel}</span>
        </nav>

        <header className="mb-10">
          <p className="text-gold tracking-[0.25em] uppercase text-xs mb-3">
            Patronage
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-5 leading-tight">
            {title}
          </h1>
          <p className="text-cream-dark leading-relaxed">
            {saints.length === 1 ? (
              <>
                The Catholic Church venerates{" "}
                <strong className="text-cream">St. {saints[0].name}</strong> as
                the patron saint of {topic.label}. Patron saints are heavenly
                intercessors — believers entrust a place, profession, or
                struggle to a saint whose own life touched it, and ask for
                their prayers before God.
              </>
            ) : (
              <>
                The Catholic Church venerates{" "}
                <strong className="text-cream">
                  {saints.length} saints
                </strong>{" "}
                as patrons of {topic.label}. Each came to this patronage
                through their own life — read their stories below and ask for
                the intercession of the one whose path speaks to yours.
              </>
            )}
          </p>
        </header>

        <section className="space-y-4 mb-12">
          {saints.map((saint) => (
            <Link
              key={saint.slug}
              href={`/saints/${saint.slug}`}
              className="block p-5 rounded-xl border border-navy-lighter bg-navy-light/40
                         hover:border-gold/40 transition-colors group"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <h2 className="text-xl font-heading font-semibold text-cream group-hover:text-gold transition-colors">
                  St. {saint.name}
                </h2>
                {saint.feast_day && (
                  <span className="text-gold/70 text-xs uppercase tracking-wider">
                    Feast: {saint.feast_day}
                  </span>
                )}
              </div>
              {saint.tagline && (
                <p className="text-gold-light/80 text-sm italic mb-2">
                  &ldquo;{saint.tagline}&rdquo;
                </p>
              )}
              {saint.known_for && (
                <p className="text-cream-dark/80 text-sm leading-relaxed">
                  {saint.known_for}
                </p>
              )}
            </Link>
          ))}
        </section>

        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs text-gold/70 uppercase tracking-wider mb-4">
              Related patronages
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/patron-saint-of/${t.slug}`}
                  className="px-3 py-1.5 rounded-full border border-navy-lighter text-sm
                             text-cream-dark/80 hover:border-gold/40 hover:text-gold transition-colors"
                >
                  {titleCaseLabel(t.label)}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="pt-8 border-t border-navy-lighter">
          <p className="text-cream-dark mb-5">
            Not sure which saint walks closest to you? The quiz matches your
            temperament against 480+ saints in about two minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="px-6 py-3 bg-gold text-navy font-semibold rounded-full text-center hover:bg-gold-light transition-colors"
            >
              Take the Saint Quiz
            </Link>
            <Link
              href="/patron-saint-of"
              className="px-6 py-3 border border-gold/40 text-gold rounded-full text-center hover:bg-gold/10 transition-colors"
            >
              All Patronages
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
