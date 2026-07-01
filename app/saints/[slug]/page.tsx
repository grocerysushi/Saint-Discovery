import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSaints, getRelatedSaints, getSaintBySlug } from "@/lib/saints";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import ShareButtons from "@/components/ShareButtons";

export const revalidate = 86400;

export async function generateStaticParams() {
  const saints = await getAllSaints();
  return saints
    .filter((s) => s.slug)
    .map((s) => ({ slug: s.slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const saint = await getSaintBySlug(slug);
  if (!saint) {
    return { title: "Saint Not Found" };
  }

  const title = `St. ${saint.name} — Biography, Feast Day & Prayer`;
  const descParts = [
    saint.patron_of ? `Patron saint of ${saint.patron_of}.` : null,
    saint.feast_day ? `Feast day: ${saint.feast_day}.` : null,
    saint.known_for ?? saint.description,
  ].filter(Boolean);
  const raw =
    descParts.join(" ") ||
    `Read the biography, feast day, and prayer of St. ${saint.name}.`;
  const description =
    raw.length > 160 ? `${raw.slice(0, 157).trimEnd()}...` : raw;

  const url = absoluteUrl(`/saints/${saint.slug}`);

  const patronKeywords = (saint.patron_of ?? "")
    .split(/,\s*/)
    .filter(Boolean)
    .slice(0, 4)
    .map((p) => `patron saint of ${p}`);

  return {
    title,
    description,
    keywords: [
      `St. ${saint.name}`,
      `Saint ${saint.name}`,
      `${saint.name} biography`,
      `${saint.name} feast day`,
      `${saint.name} prayer`,
      `who was St. ${saint.name}`,
      ...patronKeywords,
      "catholic saint",
    ],
    alternates: { canonical: `/saints/${saint.slug}` },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SaintPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const saint = await getSaintBySlug(slug);
  if (!saint) notFound();

  const url = absoluteUrl(`/saints/${saint.slug}`);
  const allSaints = await getAllSaints().catch(() => []);
  const relatedSaints = getRelatedSaints(saint, allSaints);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": url,
    url,
    name: `St. ${saint.name} — Biography, Feast Day & Prayer`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "Person",
      name: `Saint ${saint.name}`,
      alternateName: `St. ${saint.name}`,
      honorificPrefix: "St.",
      description: saint.known_for || saint.description || saint.tagline || undefined,
      gender: saint.gender || undefined,
      url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Saints",
        item: absoluteUrl("/resources"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `St. ${saint.name}`,
        item: url,
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
            href="/resources"
            className="hover:text-gold transition-colors"
          >
            Saints
          </Link>
          <span aria-hidden>/</span>
          <span className="text-cream-dark/70">St. {saint.name}</span>
        </nav>

        <article>
          <header className="mb-10">
            <p className="text-gold tracking-[0.25em] uppercase text-xs mb-3">
              Catholic Saint
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4 leading-tight">
              St. {saint.name}
            </h1>
            {saint.tagline && (
              <p className="text-gold-light text-lg italic mb-4">
                &ldquo;{saint.tagline}&rdquo;
              </p>
            )}
            <dl className="text-sm space-y-1.5">
              {saint.feast_day && (
                <div className="flex gap-2">
                  <dt className="text-cream font-semibold">Feast Day:</dt>
                  <dd className="text-cream-dark/70">{saint.feast_day}</dd>
                </div>
              )}
              {saint.patron_of && (
                <div className="flex gap-2">
                  <dt className="text-cream font-semibold">Patron Saint of:</dt>
                  <dd className="text-cream-dark/70">{saint.patron_of}</dd>
                </div>
              )}
              {(saint.dates || saint.origin) && (
                <div className="flex gap-2">
                  <dt className="text-cream font-semibold">Lived:</dt>
                  <dd className="text-cream-dark/70">
                    {[saint.dates, saint.origin].filter(Boolean).join(" — ")}
                  </dd>
                </div>
              )}
            </dl>
            {saint.known_for && (
              <p className="text-cream-dark leading-relaxed mt-5">
                {saint.known_for}
              </p>
            )}
          </header>

          {saint.description && (
            <section className="mb-10">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
                Biography
              </h2>
              <p className="text-cream-dark leading-relaxed whitespace-pre-line">
                {saint.description}
              </p>
            </section>
          )}

          {saint.quotes && saint.quotes.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
                Quotes from St. {saint.name}
              </h2>
              <ul className="space-y-4">
                {saint.quotes.map((quote) => (
                  <li key={quote}>
                    <blockquote className="border-l-2 border-gold/40 pl-4 text-cream-dark italic leading-relaxed">
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {saint.prayer && (
            <section className="mb-10 bg-navy-light/50 rounded-xl p-6 border border-navy-lighter">
              <h2 className="text-xs text-gold/70 uppercase tracking-wider mb-3">
                Prayer to St. {saint.name}
              </h2>
              <p className="text-cream-dark italic leading-relaxed whitespace-pre-line">
                {saint.prayer}
              </p>
            </section>
          )}

          {saint.fun_fact && (
            <section className="mb-10">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
                Did You Know?
              </h2>
              <p className="text-cream-dark leading-relaxed">
                {saint.fun_fact}
              </p>
            </section>
          )}

          <ShareButtons
            url={url}
            text={`St. ${saint.name} — biography, feast day, and prayer.`}
          />

          {relatedSaints.length > 0 && (
            <section className="mt-12 pt-8 border-t border-navy-lighter">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-6">
                Saints with Similar Spiritual Gifts
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedSaints.map((related) => (
                  <Link
                    key={related.id}
                    href={`/saints/${related.slug}`}
                    className="block p-4 rounded-xl border border-navy-lighter bg-navy-light/40
                               hover:border-gold/40 transition-colors group"
                  >
                    <h3 className="text-cream font-semibold group-hover:text-gold transition-colors">
                      St. {related.name}
                    </h3>
                    {related.tagline && (
                      <p className="text-cream-dark/70 text-sm italic mt-1">
                        &ldquo;{related.tagline}&rdquo;
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

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
        </article>
      </div>
    </main>
  );
}
