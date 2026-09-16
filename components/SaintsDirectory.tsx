"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { directoryOptions, EMPTY_FILTERS, getDirectoryEntry, matchesDirectoryFilters, MONTHS, STATUS_LABELS, UNCLASSIFIED, type DirectoryFilters } from "@/lib/directory-filters";
import type { Saint } from "@/lib/types";

interface PatronTopicMini { slug: string; label: string; saintCount: number }

export default function SaintsDirectory({ saints, patronTopics = [] }: { saints: Saint[]; patronTopics?: PatronTopicMini[] }) {
  const [filters, setFilters] = useState<DirectoryFilters>({ ...EMPTY_FILTERS });
  const update = (key: keyof DirectoryFilters, value: string) => setFilters(current => ({ ...current, [key]: value }));
  const reset = () => setFilters({ ...EMPTY_FILTERS });
  const entries = useMemo(() => saints.map(saint => ({ saint, facets: getDirectoryEntry(saint) })), [saints]);
  const options = useMemo(() => {
    const facets = entries.map(entry => entry.facets);
    return { country: directoryOptions(facets, "countries"), vocation: directoryOptions(facets, "vocations"), order: directoryOptions(facets, "orders") };
  }, [entries]);
  const filtered = useMemo(() => entries.filter(({ saint, facets }) => matchesDirectoryFilters(saint, facets, filters)), [entries, filters]);
  const activeCount = Object.values(filters).filter(value => value.trim() !== "").length;
  const q = filters.search.toLowerCase().trim();
  const topicMatches = useMemo(() => !q ? [] : patronTopics.filter(topic => topic.label.toLowerCase().includes(q) || topic.slug.toLowerCase().includes(q) || q.includes(topic.label.toLowerCase())).slice(0, 3), [q, patronTopics]);

  const controls: { key: "month" | "country" | "vocation" | "order" | "status"; label: string; all: string; options: { value: string; label: string }[]; unknown?: boolean }[] = [
    { key: "month", label: "Feast month", all: "Every month", options: MONTHS.map(month => ({ value: month, label: month })), unknown: true },
    { key: "country", label: "Country / region", all: "Every country / region", options: options.country.map(value => ({ value, label: value })), unknown: true },
    { key: "vocation", label: "Vocation / work", all: "Every vocation", options: options.vocation.map(value => ({ value, label: value })), unknown: true },
    { key: "order", label: "Religious order / family", all: "Every order / family", options: options.order.map(value => ({ value, label: value })), unknown: true },
    { key: "status", label: "Saint / blessed", all: "Every entry type", options: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })) },
  ];

  return (
    <div>
      <div className="directory-toolbar">
        <div className="search-field">
          <label htmlFor="saint-search" className="sr-only">Search saints by name, patronage, or feast day</label>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input id="saint-search" type="search" value={filters.search} onChange={event => update("search", event.target.value)} placeholder="Search a name, patronage, or feast day…" />
          {filters.search && <button type="button" className="search-clear" onClick={() => update("search", "")} aria-label="Clear search">×</button>}
        </div>
        <div className="gender-filters" role="group" aria-label="Filter by gender">{["", "Male", "Female"].map(gender => <button type="button" key={gender} onClick={() => update("gender", gender)} aria-pressed={filters.gender === gender}>{gender || "All entries"}</button>)}</div>
      </div>

      <fieldset className="mt-5 rounded-xl border border-white/15 bg-white/[0.025] p-4 md:p-5" aria-describedby="directory-filter-help">
        <legend className="px-2 text-sm text-gold">Explore by life, place, and feast</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {controls.map(control => <div key={control.key} className="min-w-0">
            <label htmlFor={`directory-${control.key}`} className="mb-2 block text-sm text-cream">{control.label}</label>
            <select id={`directory-${control.key}`} value={filters[control.key]} onChange={event => update(control.key, event.target.value)} className="min-h-12 w-full rounded-lg border border-white/20 bg-[#1a2b31] px-3 py-3 text-sm text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
              <option value="">{control.all}</option>
              {control.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              {control.unknown && <option value={UNCLASSIFIED}>{control.key === "month" ? "Feast not recorded" : "Not yet classified"}</option>}
            </select>
          </div>)}
        </div>
        <p id="directory-filter-help" className="mt-4 max-w-4xl text-xs leading-relaxed text-cream-dark">Places describe the origins and associations recorded in each biography, not nationality. Vocation and order filters are being classified from our sourced biographies; an unclassified entry does not mean there was no vocation or religious order. Religious families can include lay members. Feast dates may vary by calendar.</p>
        {activeCount > 0 && <button type="button" className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm text-gold hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-gold" onClick={reset}>Clear all filters ({activeCount})</button>}
      </fieldset>

      <p className="directory-count" role="status" aria-live="polite" aria-atomic="true">{filtered.length} of {saints.length} entries{q ? ` matching “${filters.search.trim()}”` : ""}{activeCount > 0 ? " with these filters" : " to get to know"}</p>
      {topicMatches.length > 0 && <section className="mb-6" aria-label="Related saint guides"><p className="mb-3 text-sm text-cream-dark">Related guides for your search (directory filters do not apply)</p><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{topicMatches.map(topic => <Link key={topic.slug} href={`/patron-saint-of/${topic.slug}`} className="topic-match"><span className="eyebrow block mb-2">Related guide</span><span className="text-cream capitalize">{topic.label}</span><span className="text-gold float-right" aria-hidden>↗</span><span className="text-cream-dark text-xs block mt-2">{topic.saintCount} linked {topic.saintCount !== 1 ? "biographies" : "biography"}</span></Link>)}</div></section>}
      {filtered.length === 0 ? <div className="result-panel text-center py-14"><h3 className="text-2xl mb-3">No entries match these filters.</h3><p className="text-cream-dark mb-5">Try another name, remove a filter, or include entries that are not yet classified.</p><button type="button" className="btn-secondary" onClick={reset}>Clear all filters</button><p className="mt-6"><Link href="/patron-saint-of" className="text-link">Browse every patronage →</Link></p></div> : <div className="saint-grid">{filtered.map(({ saint }) => <Link key={saint.id} href={`/saints/${saint.slug}`} className="saint-card">
        <div className="saint-card-top"><span className="saint-card-date">{saint.feast_day || "Feast not recorded"}</span><span className="ml-2 text-xs text-gold">{STATUS_LABELS[saint.kind ?? ""] || ""}</span></div>
        <h3>{saintDisplayName(saint)}</h3>{saint.tagline && <p className="line-clamp-2">{saint.tagline}</p>}
        <div className="saint-card-bottom"><span>{saint.origin || "A life of faith"}</span><span className="arrow" aria-hidden>↗</span></div>
      </Link>)}</div>}
    </div>
  );
}
