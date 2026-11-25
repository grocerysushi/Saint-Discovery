import type { Metadata } from "next";
import Link from "next/link";
import { FEAST_MONTHS, feastDaysInMonth } from "@/lib/feast-days";
import { getAllSaints } from "@/lib/saints";
import { absoluteUrl, serializeJsonLd, socialMetadata } from "@/lib/seo";

export const revalidate = false;

const title = "Catholic Feast Days Calendar: Saints by Month";
const description =
  "Browse Catholic saints' feast days month by month, from January to December, with links to each saint's reviewed biography and sources.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/feast-days" },
  ...socialMetadata(title, description, "/feast-days"),
};

export default async function FeastDaysPage() {
  const saints = await getAllSaints();
  const months = FEAST_MONTHS.map(month => {
    const days = feastDaysInMonth(saints, month);
    return { ...month, days: days.length, saints: days.reduce((total, day) => total + day.saints.length, 0) };
  });
  const total = months.reduce((sum, month) => sum + month.saints, 0);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Feast Days", item: absoluteUrl("/feast-days") },
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    url: absoluteUrl("/feast-days"),
    numberOfItems: months.length,
    itemListElement: months.map((month, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Catholic feast days in ${month.name}`,
      url: absoluteUrl(`/feast-days/${month.slug}`),
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
          <span className="text-cream-dark/70">Feast Days</span>
        </nav>

        <header className="mb-10">
          <p className="eyebrow mb-3">Liturgical calendar</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-5 leading-tight">
            Catholic Feast Days by Month
          </h1>
          <p className="text-cream-dark leading-relaxed">
            A feast day is the date the Church remembers a saint, often the anniversary of their death, which
            Christians call their birth into eternal life. This calendar gathers the feast days of{" "}
            <strong className="text-cream">{total} saints</strong> in the Saint Discovery directory. Choose a
            month to see each date and read the biography of the saint remembered that day.
          </p>
          <p className="text-sm text-cream-dark/80 leading-relaxed mt-4">
            Dates follow the feast day shown on each biography. Calendars can differ between countries, religious
            orders and the older and current Roman calendars.{" "}
            <Link prefetch={false} href="/editorial-policy/feast-calendars" className="underline underline-offset-4">
              Why feast dates can differ
            </Link>
            .
          </p>
        </header>

        <section aria-labelledby="months-title" className="mb-12">
          <h2 id="months-title" className="sr-only">Months</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {months.map(month => (
              <li key={month.slug}>
                <Link
                  prefetch={false}
                  href={`/feast-days/${month.slug}`}
                  className="block h-full p-5 rounded-xl border border-navy-lighter bg-navy-light/40 hover:border-gold/40 transition-colors group"
                >
                  <span className="block text-xl font-heading font-semibold text-cream group-hover:text-gold transition-colors">
                    {month.name}
                  </span>
                  <span className="text-sm text-cream-dark/80">
                    {month.saints} {month.saints === 1 ? "saint" : "saints"} on {month.days} {month.days === 1 ? "day" : "days"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-8 border-t border-navy-lighter">
          <p className="text-cream-dark mb-5">
            Looking for today? Saint of the Day follows the date where you are.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              prefetch={false}
              href="/saint-of-day"
              className="px-6 py-3 bg-gold text-navy font-semibold rounded-full text-center hover:bg-gold-light transition-colors"
            >
              Saint of the Day
            </Link>
            <Link
              prefetch={false}
              href="/resources"
              className="px-6 py-3 border border-gold/40 text-gold rounded-full text-center hover:bg-gold/10 transition-colors"
            >
              Browse all saints
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
