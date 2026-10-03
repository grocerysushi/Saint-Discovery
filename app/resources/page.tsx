import type { Metadata } from "next";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { absoluteUrl, siteConfig, serializeJsonLd } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";
import { PATRON_TOPICS } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";
import SaintsDirectory from "@/components/SaintsDirectory";
import { getSaintArtwork } from "@/lib/saint-artwork";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Catholic Resources and Saints Directory",
  description:
    "Browse Catholic resources and a sourced directory of recognized Catholic saints. Filter by feast month, country or region, vocation, and religious order.",
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

export default async function Resources() {
  const saints = await getAllSaints().catch(() => []);

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
    <main className="editorial-surface min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="site-width directory-page">
        <header className="catalogue-intro"><h1>The saints directory</h1><p>Explore {saints.length} Catholic saint biographies, with sources, historical context and room for further discovery.</p></header>
        <SaintsDirectory saints={saints} patronTopics={patronTopics} artwork={Object.fromEntries(saints.map(saint => { const {src,alt,symbolic,generated} = getSaintArtwork(saint); return [saint.slug,{src,alt,...(symbolic?{symbolic}:{}),...(generated?{generated}:{})}]; }))} />
        <section className="directory-resources"><p className="eyebrow mb-3">Keep exploring</p><h2>Resources for your faith</h2><div className="grid md:grid-cols-3 gap-4">{RESOURCES.map(r => <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="saint-card"><h3>{r.name} <span className="text-gold" aria-hidden>↗</span></h3><p>{r.description}</p></a>)}</div></section>
        <div className="guide-directory-link"><div><p className="eyebrow">Preparing for Confirmation?</p><h2>Find a saint to walk with you.</h2><p>Explore suggestions, build a shortlist, and reflect with your sponsor.</p></div><Link href="/confirmation-saint-guide" className="btn-secondary">Read the selection guide <span aria-hidden>↗</span></Link></div>
        <div className="guide-directory-link"><div><p className="eyebrow">For teachers &amp; catechists</p><h2>Bring a saint’s story into your classroom.</h2><p>Free printable reflections and a 45-minute Confirmation lesson, ready for your next session.</p></div><Link href="/resources/teachers" className="btn-secondary">Get the teaching resources <span aria-hidden>↗</span></Link></div>
        <div className="mt-10"><Link href="/quiz" className="btn-secondary">Find your saint match <span aria-hidden>↗</span></Link></div>
      </div>
    </main>
  );
}
