import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";
import SaintsDirectory from "@/components/SaintsDirectory";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Catholic Resources and Saints Directory",
  description:
    "Browse trusted Catholic resources, discover saints of the day, and search a directory of 480+ Catholic saints by name, feast day, and patronage.",
  keywords: [
    "catholic saints directory",
    "saint of the day catholic",
    "catholic resources",
    "saints by feast day",
    "catholic saint list",
    "search catholic saints",
    "saint biographies catholic",
    "list of catholic saints",
  ],
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Catholic Resources and Saints Directory",
    description:
      "Explore Catholic resources, saint biographies, feast days, and a searchable directory of 480+ saints.",
    url: absoluteUrl("/resources"),
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Saint Discovery resources and saints directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catholic Resources and Saints Directory",
    description:
      "Search saints, browse feast days, and deepen your faith with trusted Catholic resources.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const RESOURCES = [
  {
    name: "The Vatican",
    url: "https://www.vatican.va",
    description:
      "The official website of the Holy See — papal documents, encyclicals, and news from the heart of the Catholic Church.",
  },
  {
    name: "USCCB",
    url: "https://www.usccb.org",
    description:
      "The United States Conference of Catholic Bishops — daily readings, Church teachings, and resources for Catholic life in America.",
  },
  {
    name: "Catholic Answers",
    url: "https://www.catholic.com",
    description:
      "The world's largest source for Catholic apologetics — articles, podcasts, and answers to questions about the faith.",
  },
];

function getTodayFeastDay(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default async function Resources() {
  const saints = await getAllSaints().catch(() => []);
  const todayStr = getTodayFeastDay();
  const saintsOfTheDay = saints.filter(
    (s) => s.feast_day && s.feast_day.trim() === todayStr
  );

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
        name: "Catholic Resources & Saints Directory",
        item: absoluteUrl("/resources"),
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catholic Saints Directory",
    description:
      "A searchable directory of Catholic saints with biographies, feast days, and prayers.",
    url: absoluteUrl("/resources"),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: saints.length,
      itemListElement: saints.slice(0, 100).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/saints/${s.slug}`),
        name: `St. ${s.name}`,
      })),
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light/30 to-navy pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <Link
            href="/"
            className="inline-block text-gold/50 hover:text-gold text-sm transition-colors mb-6"
          >
            ← Back to Quiz
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-cream mb-4">
            Catholic Resources &amp; Saints Directory
          </h1>
          <p className="text-cream-dark text-lg max-w-xl mx-auto">
            Deepen your faith with trusted Catholic resources, and explore the
            full directory of {saints.length || "500+"} saints — biographies,
            feast days, and prayers.
          </p>
        </div>

        {saintsOfTheDay.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-heading font-semibold text-cream mb-6">
              Saint of the Day
            </h2>
            <p className="text-cream-dark/50 text-sm mb-4">{todayStr}</p>
            <div className="grid gap-4">
              {saintsOfTheDay.map((saint) => (
                <Link
                  key={saint.id}
                  href={`/saints/${saint.slug}`}
                  className="block rounded-2xl border border-gold/30 bg-gradient-to-br from-navy-light/80 to-navy-light/40 p-6 hover:border-gold/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl" aria-hidden>
                      ✦
                    </span>
                    <h3 className="text-2xl font-heading font-bold text-cream">
                      St. {saint.name}
                    </h3>
                  </div>
                  {saint.tagline && (
                    <p className="text-gold-light text-sm italic mb-4 ml-8">
                      &ldquo;{saint.tagline}&rdquo;
                    </p>
                  )}
                  {saint.description && (
                    <p className="text-cream-dark/80 text-sm leading-relaxed">
                      {saint.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-20">
          <h2 className="text-2xl font-heading font-semibold text-cream mb-6">
            Catholic Resources
          </h2>
          <div className="grid gap-4">
            {RESOURCES.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl border border-navy-lighter bg-navy-light/40
                           hover:border-gold/40 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-cream group-hover:text-gold transition-colors">
                    {r.name}
                  </h3>
                  <span className="text-gold/40 group-hover:text-gold/70 text-sm transition-colors">
                    →
                  </span>
                </div>
                <p className="text-cream-dark/70 text-sm leading-relaxed">
                  {r.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-semibold text-cream mb-2">
              Saints Directory
            </h2>
            <p className="text-cream-dark/60 text-sm">
              {saints.length} saints — explore biographies, feast days, and
              prayers.
            </p>
          </div>

          <SaintsDirectory saints={saints} />
        </section>

        <div className="text-center mt-16 text-cream-dark text-sm">
          <Link href="/" className="hover:text-gold transition-colors">
            ← Take the Quiz
          </Link>
        </div>
      </div>
    </main>
  );
}
