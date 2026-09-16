import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getAllSaints, getRelatedSaints, getSaintBySlug } from "@/lib/saints";
import { saintDisplayName } from "@/lib/saint-seo";
import { absoluteUrl } from "@/lib/seo";
import { resultPath } from "@/lib/quiz-results";
import ShareButtons from "@/components/ShareButtons";

type Props = { params: Promise<{ slug: string }> };
async function sharedSaint(slug: string) {
  const saint = await getSaintBySlug(slug);
  if (!saint || saint.kind === "unresolved" || saint.kind === "observance") return null;
  return saint;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const saint = await sharedSaint(slug);
  if (!saint) return { title: "Result not found", robots: { index: false } };
  const title = `${saintDisplayName(saint)} — Saint Discovery Quiz Match`;
  const description = `A saint match worth exploring: ${saintDisplayName(saint)}. Read their story, then take the free quiz to discover your own match.`;
  const image = absoluteUrl(`/saints/${saint.slug}/opengraph-image`);
  return { title, description, robots: { index: false, follow: true }, alternates: { canonical: resultPath(saint.slug) },
    openGraph: { title, description, url: absoluteUrl(resultPath(saint.slug)), type: "website", images: [{ url: image, width: 1200, height: 630, alt: saintDisplayName(saint) }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
export default async function SharedQuizResult({ params }: Props) {
  const { slug } = await params;
  const saint = await sharedSaint(slug);
  if (!saint) notFound();
  if (saint.slug !== slug) permanentRedirect(resultPath(saint.slug));
  const name = saintDisplayName(saint);
  const others = getRelatedSaints(saint, (await getAllSaints()).filter(item => item.kind !== "observance"), 3);
  return <main className="site-width shared-result-page"><section className="shared-result-hero"><p className="eyebrow">A Saint Discovery quiz match</p><h1>{name}</h1><p className="shared-result-intro">Every result is an invitation to get to know a life. This is the saint match someone shared with you — discover your own through the quiz.</p>{saint.feast_day && <p className="text-gold mb-5">Feast day · {saint.feast_day}</p>}<p className="text-cream-dark leading-relaxed">{saint.description}</p><div className="hero-actions"><Link href="/quiz" className="btn-primary">Find my saint match ↗</Link><Link href={`/saints/${saint.slug}`} className="btn-secondary">Read {name}’s story ↗</Link></div><p className="hero-note">Free · No account needed · About 3–5 minutes</p></section><section className="result-share-panel"><h2>Pass the discovery along</h2><ShareButtons url={absoluteUrl(resultPath(saint.slug))} text={`Explore ${name} on Saint Discovery and find your own saint match.`} /></section><section className="result-explore"><p className="eyebrow">More stories to explore</p><h2>Get to know another saint</h2><p>Related reading suggestions, not the original visitor’s quiz scores.</p><div className="result-explore-grid">{others.map(other => <Link key={other.slug} href={`/saints/${other.slug}`} className="saint-card"><h3>{saintDisplayName(other)} ↗</h3><p>{other.description}</p></Link>)}</div></section><div className="hero-actions"><Link href="/confirmation-saint-guide" className="text-link">Explore the Confirmation saint guide ↗</Link><Link href="/resources" className="text-link">Browse the full directory →</Link></div></main>;
}
