import type { Metadata } from "next";
import { absoluteUrl, serializeJsonLd, socialMetadata } from "@/lib/seo";
import { PATRON_TOPICS, titleCaseLabel } from "@/lib/patronage";
import { PATRON_GUIDES } from "@/lib/patron-guides";
import { getAllSaints } from "@/lib/saints";
import { saintDisplayName } from "@/lib/saint-seo";
import { getSaintArtwork } from "@/lib/saint-artwork";
import PatronFinder from "@/components/PatronFinder";
import "@/components/patron-finder.css";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Patron Saints by Cause and Guides for Everyday Life",
  description:
    "Explore sourced saint guides for blacksmiths, nurses, parents, students, grief, and difficult decisions, alongside an A-to-Z patron saint directory.",
  keywords: ["patron saint of", "patron saints list", "patron saints by profession", "patron saint finder", "which saint to pray to"],
  alternates: { canonical: "/patron-saint-of" },
  ...socialMetadata("Patron Saints by Cause | Saint Discovery", "Explore patronages A to Z and sourced guides to saints for everyday life.", "/patron-saint-of"),
};

export default async function PatronIndexPage() {
  const saints = await getAllSaints();
  const bySlug = new Map(saints.map(saint => [saint.slug, saint]));
  const guides = PATRON_GUIDES.map(guide => {
    const first = guide.saints[0];
    const saint = first && bySlug.get(first.slug);
    return {
      slug: guide.slug, label: guide.label, description: guide.description,
      names: guide.saints.flatMap(entry => { const match = bySlug.get(entry.slug); return match ? [saintDisplayName(match)] : []; }),
      portrait: saint ? { name: saintDisplayName(saint), artwork: getSaintArtwork(saint), connection: first.connection } : null,
    };
  });
  const topics = PATRON_TOPICS.map(topic => ({
    slug: topic.slug, label: titleCaseLabel(topic.label),
    names: topic.saints.map(slug => { const saint = bySlug.get(slug); return saint ? saintDisplayName(saint) : slug.replaceAll("-", " "); }),
  })).sort((a, b) => a.label.localeCompare(b.label));
  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Patron Saints", item: absoluteUrl("/patron-saint-of") },
    ],
  };

  return <main className="patron-discovery">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} />
    <div className="patron-discovery-inner">
      <header className="patron-discovery-header">
        <div><p className="patron-page-label">Patron saints &amp; spiritual companions</p><h1>A saint for what life brings.</h1></div>
        <p>A new responsibility. A difficult choice. Someone you love. Find a saint’s story to explore, with guides that explain each connection and its sources.</p>
      </header>
      <PatronFinder guides={guides} topics={topics} />
    </div>
  </main>;
}
