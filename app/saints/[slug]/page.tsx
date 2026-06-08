import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSaints, getSaintBySlug } from "@/lib/saints";
import { absoluteUrl, siteConfig } from "@/lib/seo";

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
    saint.tagline,
    saint.feast_day ? `Feast day: ${saint.feast_day}.` : null,
    saint.description?.slice(0, 160),
  ].filter(Boolean);
  const description =
    descParts.join(" ").slice(0, 300) ||
    `Read the biography, feast day, and prayer of St. ${saint.name}.`;

  const url = absoluteUrl(`/saints/${saint.slug}`);

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
      "catholic saint",
    ],
    alternates: { canonical: `/saints/${saint.slug}` },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "article",
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `St. ${saint.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/opengraph-image")],
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

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `Saint ${saint.name}`,
    alternateName: `St. ${saint.name}`,
    description: saint.description || saint.tagline || undefined,
    url,
    sameAs: undefined,
    additionalType: "https://schema.org/ReligiousOrganizationMember",
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
            {saint.feast_day && (
              <p className="text-cream-dark/70 text-sm">
                <strong className="text-cream">Feast Day:</strong>{" "}
                {saint.feast_day}
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
