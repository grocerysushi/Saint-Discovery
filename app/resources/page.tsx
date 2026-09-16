import type { Metadata } from "next";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { absoluteUrl, siteConfig, serializeJsonLd } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";
import { PATRON_TOPICS } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";
import SaintsDirectory from "@/components/SaintsDirectory";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Catholic Resources and Saints Directory",
  description:
    "Browse Catholic resources and a sourced saints directory. Filter by feast month, country or region, vocation, religious order, and saint or blessed status.",
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
      "Explore Catholic resources and saint biographies. Search by name or patronage, and filter by feast month, place, vocation, religious family, and status.",
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

  // Slim patron-topic index for the directory's high-intent search
  // (e.g. typing "doctors" surfaces the Patron Saint of Doctors page).
  const patronTopics = [...PATRON_GUIDES, ...PATRON_TOPICS.filter(topic => !PATRON_GUIDES.some(guide => guide.slug === topic.slug))].map((t) => ({
    slug: t.slug,
    label: t.label,
    saintCount: t.saints.length,
  }));

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
      itemListElement: saints.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/saints/${s.slug}`),
        name: saintDisplayName(s),
      })),
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="site-width directory-page">
        <header className="page-intro"><p className="eyebrow">The saints directory</p><h1>Catholic saints directory.<br /><em className="text-gold">So much to discover.</em></h1><p>Explore {saints.length} entries, from familiar companions to names you haven’t heard yet. Read their stories, find feast days, and discover the causes close to their hearts.</p></header>
        <section className="directory-resources"><p className="eyebrow mb-3">Keep exploring</p><h2>Resources for your faith</h2><div className="grid md:grid-cols-3 gap-4">{RESOURCES.map(r => <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="saint-card"><h3>{r.name} <span className="text-gold" aria-hidden>↗</span></h3><p>{r.description}</p></a>)}</div></section>
        <div className="guide-directory-link"><div><p className="eyebrow">Preparing for Confirmation?</p><h2>Find a saint to walk with you.</h2><p>Explore suggestions, build a shortlist, and reflect with your sponsor.</p></div><Link href="/confirmation-saint-guide" className="btn-secondary">Read the selection guide <span aria-hidden>↗</span></Link></div>
        <section aria-label="Saints directory"><SaintsDirectory saints={saints} patronTopics={patronTopics} /></section>
        {saintsOfTheDay.length > 0 && <section className="directory-support"><p className="eyebrow mb-3">{todayStr}</p><h2>Saint of the day</h2><div className="grid gap-4">{saintsOfTheDay.map(saint => <Link key={saint.id} href={`/saints/${saint.slug}`} className="result-panel"><h3 className="text-2xl mb-2">{saintDisplayName(saint)} <span className="text-gold" aria-hidden>↗</span></h3>{saint.tagline && <p className="text-gold italic mb-3">{saint.tagline}</p>}{saint.description && <p className="text-cream-dark leading-relaxed">{saint.description}</p>}</Link>)}</div></section>}
        <div className="mt-10"><Link href="/quiz" className="btn-secondary">Find your saint match <span aria-hidden>↗</span></Link></div>
      </div>
    </main>
  );
}
