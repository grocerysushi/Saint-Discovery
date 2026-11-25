import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FEAST_MONTHS, feastDaysInMonth, getFeastMonth } from "@/lib/feast-days";
import { getAllSaints } from "@/lib/saints";
import { saintDisplayName, saintShortSummary } from "@/lib/saint-seo";
import { absoluteUrl, serializeJsonLd, socialMetadata } from "@/lib/seo";

export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return FEAST_MONTHS.map(month => ({ month: month.slug }));
}

type Params = { month: string };

async function loadMonth(slug: string) {
  const month = getFeastMonth(slug);
  if (!month) return null;
  const days = feastDaysInMonth(await getAllSaints(), month);
  return { month, days, count: days.reduce((total, day) => total + day.saints.length, 0) };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const data = await loadMonth((await params).month);
  if (!data) return { title: "Feast Days Not Found" };
  const { month, count } = data;
  const title = `Catholic Feast Days in ${month.name}: Saints by Date`;
  const description = `${count} saints with feast days in ${month.name}, listed by date, with a short introduction and a link to each reviewed biography.`;
  return {
    title,
    description,
    alternates: { canonical: `/feast-days/${month.slug}` },
    ...socialMetadata(title, description, `/feast-days/${month.slug}`),
  };
}

export default async function FeastMonthPage({ params }: { params: Promise<Params> }) {
  const data = await loadMonth((await params).month);
  if (!data) notFound();
  const { month, days, count } = data;
  const url = absoluteUrl(`/feast-days/${month.slug}`);
  const previous = FEAST_MONTHS[(month.number + 10) % 12];
  const next = FEAST_MONTHS[month.number % 12];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Feast Days", item: absoluteUrl("/feast-days") },
      { "@type": "ListItem", position: 3, name: month.name, item: url },
    ],
  };
  const saints = days.flatMap(day => day.saints);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Catholic feast days in ${month.name}`,
    url,
    numberOfItems: saints.length,
    itemListElement: saints.map((saint, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: saintDisplayName(saint),
      url: absoluteUrl(`/saints/${saint.slug}`),
    })),
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListJsonLd) }} />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 reading-page">
        <nav aria-label="Breadcrumb" className="text-sm text-gold/60 mb-8 flex flex-wrap gap-2">
          <Link prefetch={false} href="/" className="hover:text-gold transition-colors">Home</Link>
          <span aria-hidden>/</span>
          <Link prefetch={false} href="/feast-days" className="hover:text-gold transition-colors">Feast Days</Link>
          <span aria-hidden>/</span>
          <span className="text-cream-dark/70">{month.name}</span>
        </nav>

        <header className="mb-10">
          <p className="eyebrow mb-3">Feast days</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-5 leading-tight">
            Catholic Feast Days in {month.name}
          </h1>
          <p className="text-cream-dark leading-relaxed">
            {count} {count === 1 ? "saint has a" : "saints have their"} feast day in {month.name} in the Saint Discovery
            directory, across {days.length} {days.length === 1 ? "date" : "dates"}. Each entry links to a biography
            with its sources.
          </p>
          <p className="text-sm text-cream-dark/80 leading-relaxed mt-4">
            Dates follow the feast day shown on each biography; some saints are remembered on other dates in local
            or older calendars.{" "}
            <Link prefetch={false} href="/editorial-policy/feast-calendars" className="underline underline-offset-4">
              Why feast dates can differ
            </Link>
            .
          </p>
        </header>

        <nav aria-label={`Dates in ${month.name}`} className="mb-10 flex flex-wrap gap-2">
          {days.map(day => (
            <a
              key={day.anchor}
              href={`#${day.anchor}`}
              className="px-3 py-1.5 rounded-full border border-navy-lighter text-sm text-cream-dark/80 hover:border-gold/40 hover:text-gold transition-colors"
            >
              {day.day}
            </a>
          ))}
        </nav>

        <div className="space-y-10 mb-12">
          {days.map(day => (
            <section key={day.anchor} id={day.anchor} aria-labelledby={`${day.anchor}-title`} className="scroll-mt-24">
              <h2 id={`${day.anchor}-title`} className="text-2xl font-heading font-semibold text-cream mb-4">
                {day.label}
              </h2>
              <ul className="space-y-4">
                {day.saints.map(saint => (
                  <li key={saint.slug}>
                    <Link
                      prefetch={false}
                      href={`/saints/${saint.slug}`}
                      className="block p-5 rounded-xl border border-navy-lighter bg-navy-light/40 hover:border-gold/40 transition-colors group"
                    >
                      <span className="block text-xl font-heading font-semibold text-cream group-hover:text-gold transition-colors mb-1">
                        {saintDisplayName(saint)}
                      </span>
                      <span className="block text-cream-dark/80 text-sm leading-relaxed">{saintShortSummary(saint)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <nav aria-label="Other months" className="pt-8 border-t border-navy-lighter flex flex-col sm:flex-row gap-4 justify-between">
          <Link prefetch={false} href={`/feast-days/${previous.slug}`} className="text-gold hover:text-gold-light">
            ← {previous.name} feast days
          </Link>
          <Link prefetch={false} href="/feast-days" className="text-gold hover:text-gold-light">
            All months
          </Link>
          <Link prefetch={false} href={`/feast-days/${next.slug}`} className="text-gold hover:text-gold-light">
            {next.name} feast days →
          </Link>
        </nav>
      </div>
    </main>
  );
}
