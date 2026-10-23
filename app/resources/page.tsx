import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { saintDisplayName } from "@/lib/saint-seo";
import { absoluteUrl, siteConfig, serializeJsonLd } from "@/lib/seo";
import { getAllSaints } from "@/lib/saints";
import { PATRON_TOPICS } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";
import SaintsDirectory from "@/components/SaintsDirectory";
import { getSaintArtwork } from "@/lib/saint-artwork";
import { SaintArtworkThumbnail } from "@/components/SaintArtwork";
import DirectoryDailySaints from "@/components/DirectoryDailySaints";
import { getDirectoryPage, type DirectorySearchParams } from "@/lib/directory-page";
import { directoryUrl } from "@/lib/directory-url";
import { normalizeDirectorySearch } from "@/lib/directory-filters";

export const revalidate = 86400;

const baseMetadata: Metadata = {
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

type Props = { searchParams: Promise<DirectorySearchParams> };
async function browse({ searchParams }: Props) {
  const data = getDirectoryPage(await getAllSaints(), await searchParams);
  if (!data.validPage) notFound();
  return data;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await browse(props);
  const url = absoluteUrl(directoryUrl(data.filters, data.page));
  const title = `Catholic Resources and Saints Directory${data.page > 1 ? ` — Page ${data.page}` : ""}`;
  const index = !Object.values(data.filters).some(Boolean);
  return { ...baseMetadata, title, alternates: { canonical: url }, robots: { index, follow: true },
    openGraph: { ...baseMetadata.openGraph, title, url }, twitter: { ...baseMetadata.twitter, title } };
}

export default async function Resources(props: Props) {
  const data = await browse(props);
  const { saints, filters } = data;

  // Slim patron-topic index for the directory's high-intent search
  // (e.g. typing "doctors" surfaces the Patron Saint of Doctors page).
  const patronTopics = [...PATRON_GUIDES, ...PATRON_TOPICS.filter(topic => !PATRON_GUIDES.some(guide => guide.slug === topic.slug))].map((t) => ({
    slug: t.slug,
    label: t.label,
    saintCount: t.saints.length,
  }));
  const query = normalizeDirectorySearch(filters.search);
  const topicMatches = !query ? [] : patronTopics.filter(topic => normalizeDirectorySearch(topic.label).includes(query) || normalizeDirectorySearch(topic.slug).includes(query) || query.includes(normalizeDirectorySearch(topic.label))).slice(0, 3);

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
    url: absoluteUrl(directoryUrl(filters, data.page)),
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
        position: data.offset + i + 1,
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
        <header className="catalogue-intro"><h1>The saints directory</h1><p>Explore {data.catalogueTotal} Catholic saint biographies, with sources, historical context and room for further discovery.</p></header>
        <SaintsDirectory filters={filters} options={data.options} total={data.total} catalogueTotal={data.catalogueTotal} page={data.page} pages={data.pages} offset={data.offset} count={saints.length}>
          {topicMatches.length > 0 && <section className="catalogue-related" aria-label="Related saint guides"><h2>Related patronage guides</h2><p>These guides may help your search; directory filters do not apply.</p>{topicMatches.map(topic => <Link key={topic.slug} href={`/patron-saint-of/${topic.slug}`}>{topic.label} ({topic.saintCount} biographies)</Link>)}</section>}
          {data.total === 0 ? <div className="catalogue-empty"><h2>No saints match this search.</h2><p>Try a shorter name or clear the filters to start again.</p><Link href="/resources" className="btn-secondary">Show all saints</Link></div> : <ul className="catalogue-list">{saints.map(saint => {
            const { src, alt, symbolic, generated } = getSaintArtwork(saint);
            return <li key={saint.slug}><Link href={`/saints/${saint.slug}`} className="catalogue-entry" prefetch={false}><SaintArtworkThumbnail artwork={{ src, alt, symbolic, generated }} /><h2>{saintDisplayName(saint)}</h2><p className="catalogue-life">{[saint.dates, saint.origin].filter(Boolean).join(" · ")}</p><p className="catalogue-description">{saint.description || saint.tagline}</p><p className="catalogue-feast">{saint.feast_day ? `Feast: ${saint.feast_day}` : "Feast date not yet recorded"}</p><span className="catalogue-artwork-credit">Artwork details in biography ↗</span></Link></li>;
          })}</ul>}
          {data.pages > 1 && <nav className="catalogue-pagination" aria-label="Directory pages">
            {data.page > 1 && <Link href={directoryUrl(filters, data.page - 1)} rel="prev" prefetch={false}>← Previous</Link>}
            {Array.from({ length: data.pages }, (_, i) => i + 1).filter(page => page === 1 || page === data.pages || Math.abs(page - data.page) <= 1).map((page, i, pages) => <span key={page}>{i > 0 && page - pages[i - 1] > 1 && <span className="catalogue-pagination-gap" aria-hidden>…</span>}{page === data.page ? <span className="catalogue-current-page" aria-current="page"><span className="sr-only">Page </span>{page}</span> : <Link href={directoryUrl(filters, page)} aria-label={`Page ${page}`} prefetch={false}>{page}</Link>}</span>)}
            {data.page < data.pages && <Link href={directoryUrl(filters, data.page + 1)} rel="next" prefetch={false}>Next →</Link>}
          </nav>}
        </SaintsDirectory>
        <DirectoryDailySaints />
        <div className="guide-directory-link"><div><p className="eyebrow">Not sure where to begin?</p><h2>Read two lives around one question.</h2><p>Try a guided comparison, follow the evidence, and make room for your own questions.</p></div><Link href="/resources/reading" className="btn-secondary">Choose a reading path</Link></div>
        <section className="directory-resources"><p className="eyebrow mb-3">Keep exploring</p><h2>Resources for your faith</h2><div className="grid md:grid-cols-3 gap-4">{RESOURCES.map(r => <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="saint-card"><h3>{r.name} <span className="text-gold" aria-hidden>↗</span></h3><p>{r.description}</p></a>)}</div></section>
        <div className="guide-directory-link"><div><p className="eyebrow">Preparing for Confirmation?</p><h2>Find a saint to walk with you.</h2><p>Explore suggestions, build a shortlist, and reflect with your sponsor.</p></div><Link href="/confirmation-saint-guide" className="btn-secondary">Read the selection guide <span aria-hidden>↗</span></Link></div>
        <div className="guide-directory-link"><div><p className="eyebrow">For teachers &amp; catechists</p><h2>Bring a saint’s story into your classroom.</h2><p>Free printable reflections and a 45-minute Confirmation lesson, ready for your next session.</p></div><Link href="/resources/teachers" className="btn-secondary">Get the teaching resources <span aria-hidden>↗</span></Link></div>
        <div className="mt-10"><Link href="/quiz" prefetch={false} className="btn-secondary">Find your saint match <span aria-hidden>↗</span></Link></div>
      </div>
    </main>
  );
}
