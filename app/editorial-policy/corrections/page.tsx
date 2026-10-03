import type { Metadata } from "next";
import Link from "next/link";
import { directoryCorrections } from "@/lib/directory-editorial";
import { socialMetadata } from "@/lib/seo";

const title = "Directory corrections & clarifications";
const description = "Dated records of substantive corrections and clarifications to Saint Discovery's biographies, calendar explanations, and revision information.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/editorial-policy/corrections" }, ...socialMetadata(title, description, "/editorial-policy/corrections") };

export default function DirectoryCorrections() {
  const entries = [...directoryCorrections].sort((a, b) => b.date.localeCompare(a.date));
  return <main className="reading-page">
    <p className="eyebrow mb-3">Editorial record</p>
    <h1 className="text-4xl md:text-5xl font-heading mb-6">Directory corrections &amp; clarifications</h1>
    <p className="text-cream-dark leading-relaxed mb-6">This log begins October 3, 2026. It records substantive changes from that date; it is not a complete reconstruction of earlier edits. Corrections fix an error. Clarifications explain the evidence, wording, or calendar scope more precisely without claiming that an already careful biography was wrong. Routine formatting changes are omitted.</p>
    <p className="text-cream-dark leading-relaxed mb-8">These records describe AI-assisted work. No qualified human review is implied by an entry or source link. <Link className="text-link" href="/editorial-policy">Read our review and attribution standards.</Link></p>
    <div className="space-y-10">{entries.map(entry => <article key={entry.id} id={entry.id} className="scroll-mt-24 border-t border-navy-lighter pt-6">
      <p className="eyebrow mb-3"><time dateTime={entry.date}>{entry.date}</time> · {entry.type === "correction" ? "Correction" : "Clarification"}</p>
      <h2 className="text-2xl font-heading text-cream mb-4">{entry.title}</h2>
      {entry.slug ? <p className="mb-4"><Link className="text-link" href={`/saints/${entry.slug}`}>Read the biography →</Link></p> : <p className="text-sm text-cream-dark mb-4">Scope: directory-wide presentation or revision metadata</p>}
      <dl className="text-cream-dark leading-relaxed space-y-3"><div><dt className="font-semibold text-cream">Before</dt><dd>{entry.before}</dd></div><div><dt className="font-semibold text-cream">After</dt><dd>{entry.after}</dd></div><div><dt className="font-semibold text-cream">How this was checked</dt><dd>{entry.method}</dd></div></dl>
      {entry.sources.length > 0 && <ul className="mt-4 space-y-2 text-sm">{entry.sources.map(source => <li key={source.url}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul>}
    </article>)}</div>
    <p className="mt-10 text-cream-dark">To report a problem, send the page URL, disputed passage, and supporting evidence to <a className="text-link" href="mailto:hello@saintdiscoveryquiz.com?subject=Directory%20correction">hello@saintdiscoveryquiz.com</a>. A report is a request for investigation, not an automatic correction.</p>
  </main>;
}
