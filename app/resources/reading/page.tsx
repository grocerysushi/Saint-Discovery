import type { Metadata } from "next";
import Link from "next/link";
import { READING_PATHS } from "@/lib/reading-paths";
import { getSaintBySlug } from "@/lib/saints";
import { saintDisplayName } from "@/lib/saint-seo";
import { getSaintLearningGuide } from "@/lib/saint-learning-guides";
import { socialMetadata } from "@/lib/seo";

const title = "Guided reading: compare two saints' lives";
const description = "Four reading paths with questions, source-based study guides and practical comparison exercises for exploring saints beyond a quiz match.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/resources/reading" }, ...socialMetadata(title, description, "/resources/reading") };

export default async function ReadingPaths() {
  const paths = await Promise.all(READING_PATHS.map(async path => ({ ...path, saints: await Promise.all(path.slugs.map(async slug => ({ saint: await getSaintBySlug(slug), guide: getSaintLearningGuide(slug) }))) })));
  return <main className="reading-page">
    <nav aria-label="Breadcrumb" className="mb-6"><Link href="/resources" className="text-link">Saints directory</Link></nav>
    <p className="eyebrow mb-3">Read, compare, reflect</p>
    <h1 className="text-4xl md:text-5xl font-heading mb-6">Go beyond a saint’s name</h1>
    <p className="text-cream-dark leading-relaxed mb-6">Choose a question that interests you. Read the two biographies, follow their sources, then try the comparison. These pairings are editorial study suggestions, not a ranking of saints or a claim that their lives were alike.</p>
    <section className="result-panel mb-8"><h2>Keep three kinds of notes</h2><ol className="list-decimal pl-6 space-y-3 text-cream-dark"><li><strong>What the source says:</strong> record the event or claim and its source.</li><li><strong>What remains uncertain:</strong> note approximate dates, later traditions and questions the source does not answer.</li><li><strong>Your response:</strong> write an interpretation or application in your own words. Do not turn it into a quotation attributed to the saint.</li></ol></section>
    <nav aria-label="Reading paths" className="profile-contents mb-8"><h2>Choose a path</h2><div>{paths.map((path, i) => <a key={path.title} href={`#path-${i + 1}`}>{path.title}</a>)}</div></nav>
    {paths.map((path, i) => <section key={path.title} id={`path-${i + 1}`} className="result-panel mb-8 scroll-mt-24"><p className="eyebrow">Reading path {i + 1}</p><h2>{path.title}</h2><p className="text-cream-dark leading-relaxed">{path.question}</p><ul className="space-y-5 my-5">{path.saints.map(({ saint, guide }) => saint && guide ? <li key={saint.slug}><h3 className="font-heading text-xl"><Link href={`/saints/${saint.slug}#reading-guide`} className="text-link">{saintDisplayName(saint)}</Link></h3><p className="text-cream-dark mt-2">{guide.reading.title}</p><Link href={`/saints/${saint.slug}#sources`} className="text-link text-sm">Biography sources</Link></li> : null)}</ul><h3 className="font-semibold mb-2">Try the comparison</h3><p className="text-cream-dark leading-relaxed">{path.exercise}</p></section>)}
    <p className="text-cream-dark">For a group, let everyone choose whether to share a personal application. Discuss the text without requiring private disclosures.</p>
    <div className="flex flex-wrap gap-5 mt-8"><Link href="/editorial-policy" className="text-link">How these resources are prepared</Link><Link href="/resources/teachers" className="text-link">Printable teaching resources</Link><Link href="/resources" className="text-link">Browse all saints</Link></div>
  </main>;
}
