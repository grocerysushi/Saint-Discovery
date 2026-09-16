import Link from "next/link";
import { getSaintBySlug } from "@/lib/saints";
import { saintDisplayName } from "@/lib/saint-seo";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
import { PATRON_GUIDES, type PatronGuide } from "@/lib/patron-guides";

export default async function PatronGuideContent({ guide }: { guide: PatronGuide }) {
  const entries = await Promise.all(guide.saints.map(async entry => ({
    ...entry, saint: await getSaintBySlug(entry.slug),
  })));
  const url = absoluteUrl(`/patron-saint-of/${guide.slug}`);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: guide.title, description: guide.description,
        mainEntityOfPage: url, dateModified: guide.reviewedOn,
        author: { "@type": "Organization", name: "Saint Discovery", url: absoluteUrl("/") },
        citation: [...new Set([...guide.saints, ...(guide.context ?? [])].flatMap(entry => entry.sources.map(source => source.url)))],
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Patron Saints", item: absoluteUrl("/patron-saint-of") },
        { "@type": "ListItem", position: 3, name: guide.label, item: url },
      ] },
    ],
  };

  return <main className="min-h-screen reading-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <nav aria-label="Breadcrumb" className="text-sm text-gold mb-8 flex flex-wrap gap-2">
      <Link href="/">Home</Link><span aria-hidden="true">/</span>
      <Link href="/patron-saint-of">Patron Saints</Link><span aria-hidden="true">/</span>
      <span className="text-cream-dark">{guide.label}</span>
    </nav>
    <header className="mb-10">
      <p className="eyebrow mb-3">Saints for everyday life</p>
      <h1 className="text-4xl md:text-5xl font-heading text-cream leading-tight mb-5">{guide.title}</h1>
      <p className="text-cream-dark leading-relaxed mb-4">{guide.introduction}</p>
      <p className="text-sm text-cream-dark leading-relaxed border-l-2 border-gold pl-4">{guide.distinction}</p>
      <p className="text-xs text-cream-dark mt-5">By Saint Discovery · Sources checked <time dateTime={guide.reviewedOn}>September 16, 2026</time></p>
    </header>
    <nav aria-label="On this page" className="flex flex-wrap gap-3 mb-10 text-sm text-gold">
      {entries.map(entry => <a key={entry.slug} href={`#${entry.slug}`} className="underline underline-offset-4">{entry.saint ? saintDisplayName(entry.saint) : entry.slug}</a>)}
      <a href="#put-into-practice" className="underline underline-offset-4">Put it into practice</a>
      <a href="#questions" className="underline underline-offset-4">Questions</a>
    </nav>
    <div className="space-y-6 mb-12">
      {entries.map(entry => <section id={entry.slug} key={entry.slug} className="p-6 rounded-xl border border-navy-lighter bg-navy-light/40 scroll-mt-24">
        <p className="eyebrow mb-2">{entry.connection}</p>
        <h2 className="font-heading text-2xl text-cream mb-2">{entry.saint ? saintDisplayName(entry.saint) : entry.slug}</h2>
        <p className="text-gold mb-4">{entry.relationship}</p>
        <p className="text-cream-dark leading-relaxed mb-4">{entry.explanation}</p>
        <p className="text-cream leading-relaxed mb-4"><strong>Reflect:</strong> {entry.reflection}</p>
        <ul className="text-sm text-cream-dark space-y-2 mb-5" aria-label="Sources">
          {entry.sources.map(source => <li key={source.url}>Source: <a className="text-gold underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></li>)}
        </ul>
        <Link className="inline-block text-gold font-semibold underline underline-offset-4" href={`/saints/${entry.slug}`}>Read {entry.saint ? saintDisplayName(entry.saint) : "the saint"}&apos;s biography →</Link>
        {entry.saint?.feast_day && <p className="text-sm text-cream-dark mt-3">Feast: {entry.saint.feast_day}</p>}
      </section>)}
    </div>
    {guide.context?.map(section => <section key={section.title} className="mb-10">
      <h2 className="font-heading text-2xl text-cream mb-4">{section.title}</h2>
      <p className="text-cream-dark leading-relaxed mb-4">{section.body}</p>
      {section.sources.map(source => <p key={source.url} className="text-sm text-cream-dark">Source: <a href={source.url} className="text-gold underline underline-offset-4" target="_blank" rel="noopener noreferrer">{source.title}<span className="sr-only"> (opens in a new tab)</span></a></p>)}
    </section>)}
    <section id="put-into-practice" className="mb-12 scroll-mt-24">
      <h2 className="font-heading text-3xl text-cream mb-5">{guide.practice.title}</h2>
      <ol className="list-decimal pl-6 space-y-3 text-cream-dark leading-relaxed">{guide.practice.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <div className="border-l-2 border-gold pl-5 mt-8">
        <h3 className="font-heading text-xl text-cream mb-3">A short prayer</h3>
        <p className="text-cream-dark leading-relaxed">{guide.prayer}</p>
        <p className="text-xs text-cream-dark mt-3">Original prayer written for this guide.</p>
      </div>
    </section>
    <section id="questions" className="mb-12 scroll-mt-24">
      <h2 className="font-heading text-3xl text-cream mb-5">Questions you may have</h2>
      <div className="space-y-6">{guide.questions.map(item => <div key={item.question}>
        <h3 className="font-heading text-xl text-cream mb-2">{item.question}</h3>
        <p className="text-cream-dark leading-relaxed">{item.answer}</p>
      </div>)}</div>
    </section>
    <section className="border-t border-navy-lighter pt-8">
      <h2 className="font-heading text-2xl text-cream mb-4">Explore another guide</h2>
      <div className="flex flex-wrap gap-3 mb-6">{PATRON_GUIDES.filter(other => other.slug !== guide.slug).map(other => <Link key={other.slug} href={`/patron-saint-of/${other.slug}`} className="rounded-full border border-navy-lighter px-4 py-2 text-gold hover:border-gold">{other.label}</Link>)}</div>
      <div className="flex flex-wrap gap-5 text-gold"><Link href="/patron-saint-of" className="underline underline-offset-4">Browse all patronages</Link><Link href="/resources" className="underline underline-offset-4">Saint directory</Link><Link href="/quiz" className="underline underline-offset-4">Discover a saint with the quiz</Link></div>
    </section>
  </main>;
}
