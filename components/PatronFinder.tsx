"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SaintArtworkFigure from "@/components/SaintArtwork";
import type { SaintArtwork } from "@/lib/saint-artwork";
import { patronSearchMatch, PATRON_SEARCH_TERMS } from "@/lib/patron-finder";

export type FinderGuide = {
  slug: string;
  label: string;
  description: string;
  names: string[];
  portrait: { name: string; artwork: SaintArtwork; connection: string } | null;
};
export type FinderTopic = { slug: string; label: string; names: string[] };

export default function PatronFinder({ guides, topics }: { guides: FinderGuide[]; topics: FinderTopic[] }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const foundGuides = guides.filter(guide => patronSearchMatch(query, [guide.label, guide.description, ...guide.names, PATRON_SEARCH_TERMS[guide.slug] ?? ""]));
  const foundTopics = topics.filter(topic => patronSearchMatch(query, [topic.label, ...topic.names]));
  const hasQuery = Boolean(query.trim());
  const clear = () => { setQuery(""); input.current?.focus(); };

  return <div className="patron-finder">
    <div className="patron-search-box">
      <label htmlFor="patron-search">Find a guide or patronage</label>
      <div className="patron-search-input">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        <input id="patron-search" ref={input} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try students, grief or Joseph" aria-describedby="patron-search-help" autoComplete="off" />
        {hasQuery && <button type="button" onClick={clear}>Clear</button>}
      </div>
      <p id="patron-search-help">Search a concern, occupation, place or saint’s name.</p>
      <div className="patron-search-examples"><span>Start with:</span>{["Family", "Study", "Nurses", "Grief", "Decisions"].map(term => <button type="button" key={term} aria-pressed={query === term} onClick={() => setQuery(query === term ? "" : term)}>{term}</button>)}</div>
      <noscript><p>Search needs JavaScript. All guides and patronage links are available below.</p></noscript>
    </div>

    <div className="patron-results-heading">
      <h2>{hasQuery ? "Your starting points" : "Start with everyday life"}</h2>
      <p role="status" aria-live="polite" aria-atomic="true">{foundGuides.length} {foundGuides.length === 1 ? "guide" : "guides"} · {foundTopics.length} patronage {foundTopics.length === 1 ? "topic" : "topics"}{hasQuery ? ` for “${query.trim()}”` : ""}</p>
    </div>

    {foundGuides.length > 0 && <section aria-label="Guides for everyday life" className={`patron-guide-gallery${foundGuides.length === 1 ? " patron-guide-single" : ""}`}>
      {foundGuides.map(guide => <article key={guide.slug} className="patron-guide-card">
        {guide.portrait && <SaintArtworkFigure artwork={guide.portrait.artwork} name={guide.portrait.name} />}
        <div className="patron-guide-copy">
          <h3><Link href={`/patron-saint-of/${guide.slug}`} prefetch={false}>{guide.label}<span aria-hidden="true">↗</span></Link></h3>
          {guide.portrait && <p className="patron-guide-person">{guide.portrait.name}<span>{guide.portrait.connection}</span></p>}
          <p className="patron-guide-description">{guide.description}</p>
          <Link className="patron-guide-open" href={`/patron-saint-of/${guide.slug}`} prefetch={false}>Explore the {guide.label.toLowerCase()} guide</Link>
        </div>
      </article>)}
    </section>}

    {foundTopics.length > 0 && <section className="patron-topic-index" aria-labelledby="patron-topic-title">
      <div><h2 id="patron-topic-title">{hasQuery ? "Matching patronages" : "Browse patronages A–Z"}</h2><p>Connections recorded in our saint biographies. Open a topic to meet its saints.</p></div>
      <div className="patron-topic-list">{foundTopics.map(topic => <Link key={topic.slug} href={`/patron-saint-of/${topic.slug}`} prefetch={false}><span>{topic.label}</span><span>{topic.names.length} {topic.names.length === 1 ? "saint" : "saints"} <span aria-hidden="true">↗</span></span></Link>)}</div>
    </section>}

    {foundGuides.length === 0 && foundTopics.length === 0 && <section className="patron-no-results"><h3>No guide or patronage found for “{query.trim()}”.</h3><p>Try a broader word, such as “family” or “study”. Our directory may still have the saint you’re looking for.</p><button type="button" onClick={clear}>Show all starting points</button><Link prefetch={false} href="/resources">Search the saints directory</Link></section>}

    <aside className="patron-finder-note"><h2>A patron or a companion?</h2><p>Some connections are documented or traditional patronages. Others are invitations to reflect with a saint whose life speaks to a situation. Each guide explains the distinction and links its sources.</p><Link prefetch={false} href="/quiz">Not sure where to begin? Take the saint quiz.</Link></aside>
  </div>;
}
