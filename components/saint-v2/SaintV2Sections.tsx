import Link from "next/link";
import type { RelatedSaintLink, Saint, SaintPlace, SaintPrayer, SaintQuote, SaintSymbol } from "@/lib/types";

// Template version 2 sections for saint pages. Each renders nothing when its
// data is empty, so a page never shows a blank or "n/a" value.

const SECTION = "mb-10 scroll-mt-24";
const HEADING = "text-2xl font-heading font-semibold text-cream mb-4";
const BODY = "text-cream-dark leading-relaxed";

export function HeroSummary({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="text-cream-dark text-lg leading-relaxed mb-5">{text}</p>;
}

export interface PatronageLink { slug: string; label: string }

export function AtAGlance({ saint, patronages, symbols }: { saint: Saint; patronages: PatronageLink[]; symbols?: SaintSymbol[] }) {
  const lived = [saint.dates, saint.origin].filter(Boolean).join(" — ");
  const rows: { term: string; value: React.ReactNode }[] = [];
  if (saint.feast_day) rows.push({ term: "Feast", value: saint.feast_day });
  if (patronages.length > 0) {
    rows.push({
      term: "Patron of",
      value: patronages.map((link, i) => (
        <span key={link.slug}>
          {i > 0 && ", "}
          <Link prefetch={false} href={`/patron-saint-of/${link.slug}`} className="underline decoration-gold/40 underline-offset-2 hover:text-gold">
            {link.label}
          </Link>
        </span>
      )),
    });
  }
  if (lived) rows.push({ term: "Lived", value: lived });
  if (symbols && symbols.length > 0) rows.push({ term: "Symbols", value: symbols.map(s => s.symbol).join(" · ") });
  if (rows.length === 0) return null;
  return (
    <section aria-labelledby="at-a-glance-title" className="saint-v2-glance mb-6 rounded-xl border border-navy-lighter bg-navy-light p-6">
      <h2 id="at-a-glance-title" className="eyebrow mb-4">At a glance</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
        {rows.map(row => (
          <div key={row.term} className="contents">
            <dt className="font-semibold text-cream">{row.term}</dt>
            <dd className="text-cream-dark">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function WhyWeTurn({ name, text }: { name: string; text?: string }) {
  if (!text) return null;
  return (
    <section id="why-we-turn" aria-labelledby="why-we-turn-title" className={SECTION}>
      <h2 id="why-we-turn-title" className={HEADING}>Why we turn to {name}</h2>
      <p className={BODY}>{text}</p>
    </section>
  );
}

export function InTheirOwnWords({ quotes }: { quotes?: SaintQuote[] }) {
  if (!quotes || quotes.length === 0) return null;
  return (
    <section id="own-words" aria-labelledby="own-words-title" className={SECTION}>
      <h2 id="own-words-title" className={HEADING}>In their own words</h2>
      <ul className="space-y-6">
        {quotes.map(quote => (
          <li key={quote.text}>
            <figure>
              <blockquote className="border-l-2 border-gold/40 pl-4 text-cream-dark italic leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <figcaption className="mt-2 pl-4 text-sm text-cream-dark/80">
                {quote.work} · {quote.translation} (public domain)
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SaintPrayerSection({ name, prayer }: { name: string; prayer?: SaintPrayer }) {
  if (!prayer?.text) return null;
  const label = prayer.kind === "traditional" ? `Traditional prayer · ${prayer.source}` : "An original prayer by Saint Discovery";
  return (
    <section id="prayer" aria-labelledby="prayer-title" className={`${SECTION} rounded-xl border border-navy-lighter bg-navy-light p-7`}>
      <h2 id="prayer-title" className={HEADING}>A prayer with {name}</h2>
      <p className="text-cream-dark italic leading-relaxed whitespace-pre-line">{prayer.text}</p>
      <p className="mt-4 text-sm text-cream-dark/80">{label}</p>
      {prayer.note && <p className="mt-2 text-sm text-cream-dark/80">{prayer.note}</p>}
      {prayer.link && (
        <p className="mt-2 text-sm">
          <a href={prayer.link.url} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-4">{prayer.link.label} ↗</a>
        </p>
      )}
    </section>
  );
}

export function SymbolsInArt({ symbols }: { symbols?: SaintSymbol[] }) {
  if (!symbols || symbols.length === 0) return null;
  return (
    <section id="symbols" aria-labelledby="symbols-title" className={SECTION}>
      <h2 id="symbols-title" className={HEADING}>Symbols in art</h2>
      <dl className="space-y-4">
        {symbols.map(item => (
          <div key={item.symbol}>
            <dt className="font-semibold text-cream">{item.symbol}</dt>
            <dd className={BODY}>{item.meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FeastCustoms({ customs, feastDay }: { customs?: string[]; feastDay?: string | null }) {
  if (!customs || customs.length === 0) return null;
  return (
    <section id="feast" aria-labelledby="feast-title" className={SECTION}>
      <h2 id="feast-title" className={HEADING}>Celebrating the feast{feastDay ? ` · ${feastDay}` : ""}</h2>
      <ul className={`${BODY} list-disc space-y-2 pl-5`}>
        {customs.map(custom => <li key={custom}>{custom}</li>)}
      </ul>
    </section>
  );
}

export function PlacesToVisit({ places }: { places?: SaintPlace[] }) {
  if (!places || places.length === 0) return null;
  return (
    <section id="places" aria-labelledby="places-title" className={SECTION}>
      <h2 id="places-title" className={HEADING}>Places to visit</h2>
      <ul className="space-y-3">
        {places.map(place => (
          <li key={place.url} className={BODY}>
            <a href={place.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-cream underline decoration-gold/40 underline-offset-4 hover:text-gold">
              {place.name} ↗
            </a>
            <span className="text-cream-dark/80"> · {place.city}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ForConfirmation({ note }: { note?: string }) {
  if (!note) return null;
  return (
    <section id="confirmation" aria-labelledby="confirmation-title" className={SECTION}>
      <h2 id="confirmation-title" className={HEADING}>For Confirmation</h2>
      <p className={BODY}>
        {note}{" "}
        <Link prefetch={false} href="/confirmation-saint-guide" className="text-gold underline underline-offset-4">
          Read the Confirmation saint guide →
        </Link>
      </p>
    </section>
  );
}

export function Reflect({ name, prompts }: { name: string; prompts?: string[] }) {
  if (!prompts || prompts.length === 0) return null;
  return (
    <section id="reflection" className="biography-reflection" aria-labelledby="reflection-title">
      <p className="eyebrow">From reading to reflection</p>
      <h2 id="reflection-title">Reflect</h2>
      <p>After reading about {name}, take a moment to consider:</p>
      <ol>{prompts.map(prompt => <li key={prompt}>{prompt}</li>)}</ol>
      <p className="text-sm">These are reflection prompts from Saint Discovery, not quotations from the saint.</p>
      <div className="flex flex-wrap gap-4 mt-5">
        <Link prefetch={false} href="/saint-of-day" className="text-link">Continue with a daily reflection →</Link>
      </div>
    </section>
  );
}

export interface ResolvedRelatedSaint extends RelatedSaintLink { name: string }

export function RelatedSaintsV2({ related }: { related: ResolvedRelatedSaint[] }) {
  if (related.length === 0) return null;
  return (
    <section className="mt-12 pt-8 border-t border-navy-lighter" aria-labelledby="related-saints-title">
      <h2 id="related-saints-title" className="text-2xl font-heading font-semibold text-cream mb-6">Related saints</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {related.map(entry => (
          <Link
            prefetch={false}
            key={entry.slug}
            href={`/saints/${entry.slug}`}
            className="group block rounded-xl border border-navy-lighter bg-navy-light/40 p-4 transition-colors hover:border-gold/40"
          >
            <h3 className="font-semibold text-cream transition-colors group-hover:text-gold">{entry.name}</h3>
            <p className="mt-1 text-sm text-cream-dark/80">{entry.reason}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
