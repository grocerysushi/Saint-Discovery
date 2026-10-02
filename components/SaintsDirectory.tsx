"use client";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import { directoryOptions, EMPTY_FILTERS, getDirectoryEntry, matchesDirectoryFilters, normalizeDirectorySearch, MONTHS, UNCLASSIFIED, type DirectoryFilters } from "@/lib/directory-filters";
import { readDirectoryQuery, directoryQuery } from "@/lib/directory-url";
import type { Saint } from "@/lib/types";
import DirectoryDailySaints from "@/components/DirectoryDailySaints";

interface PatronTopicMini { slug: string; label: string; saintCount: number }
const subscribeQuery = (notify: () => void) => {
  window.addEventListener("popstate", notify);
  window.addEventListener("directory-query-change", notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener("directory-query-change", notify); };
};
const querySnapshot = () => window.location.search;
const serverQuery = () => "";

export default function SaintsDirectory({ saints, patronTopics = [] }: { saints: Saint[]; patronTopics?: PatronTopicMini[] }) {
  const query = useSyncExternalStore(subscribeQuery, querySnapshot, serverQuery);
  const filters = useMemo(() => readDirectoryQuery(query), [query]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const write = (next: DirectoryFilters) => {
    const parameters = directoryQuery(next);
    window.history.replaceState(window.history.state, "", `/resources${parameters ? `?${parameters}` : ""}`);
    window.dispatchEvent(new Event("directory-query-change"));
  };
  const update = (key: keyof DirectoryFilters, value: string) => write({ ...filters, [key]: value });
  const reset = () => { write({ ...EMPTY_FILTERS }); search.current?.focus(); };
  const entries = useMemo(() => saints.map(saint => ({ saint, facets: getDirectoryEntry(saint) })), [saints]);
  const options = useMemo(() => {
    const facets = entries.map(entry => entry.facets);
    return { country: directoryOptions(facets, "countries"), vocation: directoryOptions(facets, "vocations"), order: directoryOptions(facets, "orders") };
  }, [entries]);
  const filtered = useMemo(() => entries.filter(({ saint, facets }) => matchesDirectoryFilters(saint, facets, filters)), [entries, filters]);
  const activeCount = Object.values(filters).filter(value => value.trim() !== "").length;
  const q = normalizeDirectorySearch(filters.search);
  const topicMatches = useMemo(() => !q ? [] : patronTopics.filter(topic => normalizeDirectorySearch(topic.label).includes(q) || normalizeDirectorySearch(topic.slug).includes(q) || q.includes(normalizeDirectorySearch(topic.label))).slice(0, 3), [q, patronTopics]);
  const controls: { key: "gender" | "month" | "country" | "vocation" | "order"; label: string; all: string; options: string[]; unknown?: boolean }[] = [
    { key: "country", label: "Country or region", all: "Every place", options: options.country, unknown: true },
    { key: "gender", label: "Women and men", all: "Everyone", options: ["Female", "Male"] },
    { key: "month", label: "Feast month", all: "Every month", options: MONTHS, unknown: true },
    { key: "vocation", label: "Vocation or work", all: "Every vocation", options: options.vocation, unknown: true },
    { key: "order", label: "Religious order or family", all: "Every order", options: options.order, unknown: true },
  ];
  return <><section className="catalogue-layout" aria-label="Saints directory">
    <aside className="catalogue-filters" aria-label="Directory filters">
      <h2>Find by life &amp; place</h2>
      <button type="button" className="catalogue-filter-toggle" aria-expanded={filtersOpen} aria-controls="catalogue-filter-fields" onClick={() => setFiltersOpen(!filtersOpen)}>Filters{activeCount ? ` (${activeCount})` : ""}<span aria-hidden>{filtersOpen ? "-" : "+"}</span></button>
      <div id="catalogue-filter-fields" data-expanded={filtersOpen}>
        <fieldset><legend className="sr-only">Refine the saint directory</legend>
          {controls.map(control => <div className="catalogue-field" key={control.key}><label htmlFor={`directory-${control.key}`}>{control.label}</label><select id={`directory-${control.key}`} value={filters[control.key]} onChange={event => update(control.key, event.target.value)}>
            <option value="">{control.all}</option>{control.options.map(value => <option key={value} value={value}>{value === "Female" ? "Women" : value === "Male" ? "Men" : value}</option>)}
            {control.unknown && <option value={UNCLASSIFIED}>{control.key === "month" ? "Feast not recorded" : "Not yet classified"}</option>}
          </select></div>)}
        </fieldset>
        <p className="catalogue-help">Places reflect the biography, not modern nationality. Dates can vary by calendar. “Not yet classified” means research is still in progress.</p>
        <Link href="/editorial-policy">How we research these lives</Link>
      </div>
    </aside>
    <div className="catalogue-results">
      <div className="catalogue-search"><label htmlFor="saint-search">Search the directory</label><div><input ref={search} id="saint-search" type="search" value={filters.search} onChange={event => update("search", event.target.value)} placeholder="Name, place or patronage" />{filters.search && <button type="button" onClick={() => { update("search", ""); search.current?.focus(); }} aria-label="Clear search">Clear</button>}</div></div>
      <div className="catalogue-result-summary"><p className="directory-count" role="status" aria-live="polite" aria-atomic="true">{filtered.length} of {saints.length} saints{q ? ` matching “${filters.search.trim()}”` : ""}</p>{activeCount > 0 && <button type="button" className="catalogue-reset" onClick={reset}>Clear all filters</button>}</div>
      {topicMatches.length > 0 && <section className="catalogue-related" aria-label="Related saint guides"><h2>Related patronage guides</h2><p>These guides may help your search; directory filters do not apply.</p>{topicMatches.map(topic => <Link key={topic.slug} href={`/patron-saint-of/${topic.slug}`}>{topic.label} ({topic.saintCount} biographies)</Link>)}</section>}
      {filtered.length === 0 ? <div className="catalogue-empty"><h2>No saints match this search.</h2><p>Try a shorter name or clear the filters to start again.</p><button type="button" className="btn-secondary" onClick={reset}>Show all saints</button></div> : <ul className="catalogue-list">{filtered.map(({ saint }) => <li key={saint.id}><Link href={`/saints/${saint.slug}`} className="catalogue-entry"><h2>{saintDisplayName(saint)}</h2><p className="catalogue-life">{[saint.dates,saint.origin].filter(Boolean).join(" · ")}</p><p className="catalogue-description">{saint.description || saint.tagline}</p><p className="catalogue-feast">{saint.feast_day ? `Feast: ${saint.feast_day}` : "Feast date not yet recorded"}</p></Link></li>)}</ul>}
    </div>
  </section><DirectoryDailySaints saints={saints} /></>;
}
