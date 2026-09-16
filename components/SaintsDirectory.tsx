"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { Saint } from "@/lib/types";

interface PatronTopicMini {
  slug: string;
  label: string;
  saintCount: number;
}

export default function SaintsDirectory({
  saints,
  patronTopics = [],
}: {
  saints: Saint[];
  patronTopics?: PatronTopicMini[];
}) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  const q = search.toLowerCase().trim();

  // Patron-topic matches: when the user types a query that lines up with a
  // patronage (e.g. "doctors", "anxiety", "lost causes"), surface a link to
  // the /patron-saint-of/[topic] page as a result. This is the high-intent
  // search case the previous version missed entirely.
  const topicMatches = useMemo(() => {
    if (q === "") return [];
    return patronTopics
      .filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          q.includes(t.label.toLowerCase())
      )
      .slice(0, 3);
  }, [q, patronTopics]);

  const filtered = useMemo(() => {
    if (q === "") {
      return saints.filter(
        (s) => genderFilter === "All" || s.gender === genderFilter
      );
    }
    return saints.filter((s) => {
      if (genderFilter !== "All" && s.gender !== genderFilter) return false;
      // Whole-word match on patron_of so "anxiety" doesn't match against a
      // comma-list that happens to contain the substring. Fall back to a
      // plain substring for everything else where partial matches are fine.
      const patronOf = (s.patron_of ?? "").toLowerCase();
      const patronTerms = patronOf
        .split(/,\s*/)
        .map((t) => t.trim())
        .filter(Boolean);
      const patronHit =
        patronTerms.some((t) => t === q) ||
        patronTerms.some((t) => t.includes(q)) ||
        patronOf.includes(q);

      return (
        s.name.toLowerCase().includes(q) ||
        (s.tagline && s.tagline.toLowerCase().includes(q)) ||
        (s.feast_day && s.feast_day.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.origin && s.origin.toLowerCase().includes(q)) ||
        patronHit
      );
    });
  }, [saints, q, genderFilter]);

  const hasNoResults = filtered.length === 0 && topicMatches.length === 0;

  return (
    <div>
      <div className="directory-toolbar">
        <div className="search-field">
          <label htmlFor="saint-search" className="sr-only">Search saints by name, patronage, or feast day</label>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input id="saint-search" type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a name, patronage, or feast day…" />
          {search && <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
        </div>
        <div className="gender-filters" role="group" aria-label="Filter by gender">{["All", "Male", "Female"].map(g => <button key={g} onClick={() => setGenderFilter(g)} aria-pressed={genderFilter === g}>{g === "All" ? "All saints" : g}</button>)}</div>
      </div>
      <p className="directory-count" role="status" aria-live="polite" aria-atomic="true">{filtered.length} saint{filtered.length !== 1 ? "s" : ""}{q ? ` matching “${search.trim()}”` : " to get to know"}{topicMatches.length > 0 ? ` · ${topicMatches.length} patronage matches` : ""}</p>
      {hasNoResults ? <div className="result-panel text-center py-14"><h3 className="text-2xl mb-3">No saints found just yet.</h3><p className="text-cream-dark mb-5">Try another name or a broader search, like “teachers” or “June”.</p><button className="btn-secondary" onClick={() => { setSearch(""); setGenderFilter("All"); }}>Reset search</button><p className="mt-6"><Link href="/patron-saint-of" className="text-link">Browse every patronage →</Link></p></div> : <>
        {topicMatches.length > 0 && <section className="mb-6" aria-label="Matching patronages"><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{topicMatches.map(t => <Link key={t.slug} href={`/patron-saint-of/${t.slug}`} className="topic-match"><span className="eyebrow block mb-2">Related patronage</span><span className="text-cream capitalize">{t.label}</span><span className="text-gold float-right" aria-hidden>↗</span><span className="text-cream-dark text-xs block mt-2">{t.saintCount} saint{t.saintCount !== 1 ? "s" : ""}</span></Link>)}</div></section>}
        <div className="saint-grid">{filtered.map(saint => <Link key={saint.id} href={`/saints/${saint.slug}`} className="saint-card">
          {saint.feast_day && <div className="saint-card-top"><span className="saint-card-date">{saint.feast_day}</span></div>}
          <h3>{saintDisplayName(saint)}</h3>{saint.tagline && <p className="line-clamp-2">{saint.tagline}</p>}
          <div className="saint-card-bottom"><span>{saint.origin || "A life of faith"}</span><span className="arrow" aria-hidden>↗</span></div>
        </Link>)}</div>
      </>}
    </div>
  );
}
