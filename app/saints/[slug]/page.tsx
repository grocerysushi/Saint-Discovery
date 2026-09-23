import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllSaints, getAllSaintSlugs, getRelatedSaints, getSaintBySlug } from "@/lib/saints";
import { getBiographyReview } from "@/lib/saint-reviews";
import { absoluteUrl, siteConfig, serializeJsonLd } from "@/lib/seo";
import { getPatronLinksForSaint } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";
import { saintDisplayName, saintSearchSummary } from "@/lib/saint-seo";
import ShareButtons from "@/components/ShareButtons";
import BiographyJourney from "@/components/BiographyJourney";
import BlogRecommendations from "@/components/BlogRecommendations";
import saintExtended from "@/lib/data/saint-extended.json";

// Legacy generated copy is replaced as each external-source review is completed.
// Its former model-only checking process was not independent fact verification.
interface ExtendedContent {
  biography: string[];
  faqs: { question: string; answer: string }[];
}
const EXTENDED = saintExtended as unknown as Record<string, ExtendedContent>;

export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllSaintSlugs().map(slug => ({ slug }));
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

  const { title, description } = saintSearchSummary(saint);
  const url = absoluteUrl(`/saints/${saint.slug}`);
  const images = [{ url: absoluteUrl(`/saints/${saint.slug}/opengraph-image`), width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    alternates: { canonical: `/saints/${saint.slug}` },
    ...(saint.kind === "unresolved" ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      images,
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
  if (saint.slug !== slug) permanentRedirect(`/saints/${saint.slug}`);

  const url = absoluteUrl(`/saints/${saint.slug}`);
  const allSaints = await getAllSaints().catch(() => []);
  const relatedSaints = saint.kind === "unresolved" || saint.kind === "observance"
    ? [] : getRelatedSaints(saint, allSaints.filter(entry => entry.kind !== "observance"));
  const review = getBiographyReview(saint.slug);
  const extended = review ? { biography: review.biography, faqs: [] } : EXTENDED[saint.slug];
  const { name, title, description } = saintSearchSummary(saint);
  const patronLinks = getPatronLinksForSaint(saint.slug);
  const relatedGuides = PATRON_GUIDES.filter(guide => guide.saints.some(entry => entry.slug === saint.slug));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    url,
    headline: title,
    description,
    inLanguage: "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: { "@type": "Thing", name },
    publisher: { "@id": absoluteUrl("/#organization") },
    isPartOf: { "@id": absoluteUrl("/#website") },
    ...(review ? { dateModified: review.reviewed_on, citation: review.sources.map(source => source.url) } : {}),
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
        name,
        item: url,
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {extended && extended.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: extended.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            }),
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 reading-page">
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
          <span className="text-cream-dark/70">{name}</span>
        </nav>

        {saint.kind !== "unresolved" && saint.kind !== "observance" && <BiographyJourney slug={saint.slug} />}
        <article>
          <header className="mb-10">
            <p className="eyebrow mb-3">
              Saints &amp; Catholic tradition
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4 leading-tight">
              {name}
            </h1>
            {review?.kind === "orthodox-saint" && <p className="text-gold mb-4">Venerated in Orthodox Christianity</p>}
            {review?.kind === "unresolved" && <p className="text-gold mb-4">This identity could not be established from reliable sources. Its earlier biographical claims have been withdrawn.</p>}
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
                  <dd className="text-cream-dark/70">
                    {patronLinks.length > 0
                      ? patronLinks.map((link, i) => (
                          <span key={link.slug}>
                            {i > 0 && ", "}
                            <Link
                              href={`/patron-saint-of/${link.slug}`}
                              className="hover:text-gold underline decoration-gold/30 underline-offset-2 transition-colors"
                            >
                              {link.label}
                            </Link>
                          </span>
                        ))
                      : saint.patron_of}
                  </dd>
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
            {review?.feast_note && <p className="text-sm text-cream-dark/70 mt-3">{review.feast_note}</p>}
            {saint.known_for && (
              <p className="text-cream-dark leading-relaxed mt-5">
                {saint.known_for}
              </p>
            )}
          </header>

          <nav aria-label="On this page" className="flex flex-wrap gap-4 mb-8 text-sm text-gold">
            {saint.kind !== "unresolved" && saint.kind !== "observance" && <a href="#reflection" className="underline underline-offset-4">Reflect on this life</a>}
            {review && <a href="#sources" className="underline underline-offset-4">Sources</a>}
            {(extended || saint.description) && <a href="#biography" className="underline underline-offset-4">Biography</a>}
            {saint.prayer && <a href="#prayer" className="underline underline-offset-4">Prayer</a>}
            {extended && extended.faqs.length > 0 && <a href="#questions" className="underline underline-offset-4">Common questions</a>}
          </nav>

          {extended ? (
            <section id="biography" className="mb-10 scroll-mt-24">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
                Biography
              </h2>
              <div className="text-cream-dark leading-relaxed space-y-4">
                {extended.biography.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : (
            saint.description && (
              <section id="biography" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
                  Biography
                </h2>
                <p className="text-cream-dark leading-relaxed whitespace-pre-line">
                  {saint.description}
                </p>
              </section>
            )
          )}

          {saint.kind !== "unresolved" && saint.kind !== "observance" && <BlogRecommendations key={saint.slug} saintSlug={saint.slug} placement="biography_blog" />}

          {saint.kind !== "unresolved" && saint.kind !== "observance" && <section id="reflection" className="biography-reflection" aria-labelledby="reflection-title"><p className="eyebrow">From reading to reflection</p><h2 id="reflection-title">What will you carry with you?</h2><p>After reading about {name}, take a moment to consider:</p><ol><li>Which event or decision in this life stood out to you?</li><li>What virtue would you like to understand or practice more deeply?</li><li>What small action could you take today in response?</li></ol><p className="text-sm">These are reflection prompts from Saint Discovery, not quotations from the saint.</p><div className="flex flex-wrap gap-4 mt-5"><Link href="/confirmation-saint-guide" className="btn-secondary">Explore your Confirmation choice →</Link><Link href="/saint-of-day" className="text-link">Continue with a daily reflection →</Link></div></section>}
          {saint.quotes && saint.quotes.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-4">
                Quotes from {name}
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
            <section id="prayer" className="mb-10 scroll-mt-24 bg-navy-light rounded-xl p-7 border border-navy-lighter">
              <h2 className="text-xs text-gold/70 uppercase tracking-wider mb-3">
                Prayer to {name}
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

          {extended && extended.faqs.length > 0 && (
            <section id="questions" className="mb-10 scroll-mt-24">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-6">
                Frequently Asked Questions
              </h2>
              <dl className="space-y-6">
                {extended.faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="text-cream font-semibold mb-2">
                      {faq.question}
                    </dt>
                    <dd className="text-cream-dark leading-relaxed">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {review && (
            <section id="sources" className="mb-10 border-t border-navy-lighter pt-7">
              <h2 className="text-2xl font-heading font-semibold text-cream mb-4">Sources and further reading</h2>
              <ul className="space-y-3 text-cream-dark">
                {review.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="underline decoration-gold/40 underline-offset-4 hover:text-gold">{source.title} ↗</a></li>)}
              </ul>
              <p className="text-sm text-cream-dark/70 mt-4">{review.status === "needs-identification" ? "Identity investigated" : "Compared with these sources"} on {review.reviewed_on}. Historical uncertainties and later traditions are identified in the biography.</p>
            </section>
          )}

          <ShareButtons
            url={url}
            text={title}
          />

          {relatedGuides.length > 0 && (
            <section className="mt-12 pt-8 border-t border-navy-lighter" aria-labelledby="related-guides-heading">
              <h2 id="related-guides-heading" className="text-2xl font-heading font-semibold text-cream mb-4">Explore this saint in everyday life</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedGuides.map(guide => (
                  <Link key={guide.slug} href={`/patron-saint-of/${guide.slug}`} className="block rounded-xl border border-navy-lighter bg-navy-light/40 p-4 hover:border-gold/40">
                    <h3 className="font-semibold text-gold">{guide.title}</h3>
                    <p className="mt-2 text-sm text-cream-dark">{guide.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

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
                      {saintDisplayName(related)}
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
              href="/quiz"
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
