import Link from "next/link";
import type { SaintReaderGuide } from "@/lib/saint-reader-guides";

export default function SaintReaderQuestions({ guide }: { guide: SaintReaderGuide }) {
  return (
    <section id="quick-answers" aria-labelledby="quick-answers-title" className="mb-10 scroll-mt-24">
      <h2 id="quick-answers-title" className="text-2xl font-heading font-semibold text-cream mb-6">{guide.heading}</h2>
      <div className="space-y-6">
        {guide.questions.map(({ question, answer, sources }) => (
          <div key={question}>
            <h3 className="text-lg font-semibold text-cream mb-2">{question}</h3>
            <p className="text-cream-dark leading-relaxed">{answer}</p>
            <ul className="mt-2 space-y-2 text-sm">
              {sources.map(source => <li key={source.url}><a className="text-gold underline underline-offset-4" href={source.url}>{source.title} ↗</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      {guide.prayer && <div className="mt-6 rounded-xl border border-navy-lighter bg-navy-light p-5">
        <h3 className="text-lg font-semibold text-cream mb-2">A prayer for courage and care</h3>
        <p className="text-cream-dark leading-relaxed">{guide.prayer}</p>
        <p className="mt-2 text-sm text-cream-dark/70">Original prayer by Saint Discovery; not a quotation from the saint or an official liturgical text.</p>
      </div>}
      <p className="mt-5 text-sm text-cream-dark/70">These answers were compared with the linked sources on <time dateTime={guide.reviewedOn}>{guide.reviewedOn}</time> using AI assistance.</p>
      <nav aria-label="Continue exploring" className="mt-4 flex flex-col gap-3">
        {guide.related.map(link => <Link key={link.href} href={link.href} className="text-gold underline underline-offset-4">{link.label} →</Link>)}
      </nav>
    </section>
  );
}
