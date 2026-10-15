"use client";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EMPTY_FILTERS, MONTHS, UNCLASSIFIED, type DirectoryFilters, type DirectoryOptions } from "@/lib/directory-shared";
import { directoryQuery, directoryUrl } from "@/lib/directory-url";
import { isTranslationProxy, proxyNavigationUrl } from "@/lib/site-languages";

export default function SaintsDirectory({ filters, options, total, catalogueTotal, page, pages, offset, count, children }: {
  filters: DirectoryFilters; options: DirectoryOptions; total: number; catalogueTotal: number;
  page: number; pages: number; offset: number; count: number; children: ReactNode;
}) {
  const router = useRouter();
  const query = directoryQuery(filters);
  const [state, setState] = useState({ applied: query, submitted: query, draft: filters });
  // Reconcile URL navigation (including Back) without replacing the search
  // input or discarding keystrokes while our previous request finishes.
  if (state.applied !== query) setState({ ...state, applied: query, draft: state.submitted === query ? state.draft : filters });
  const [pending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const cancel = () => clearTimeout(timer.current);
    window.addEventListener("popstate", cancel);
    return () => { cancel(); window.removeEventListener("popstate", cancel); };
  }, []);
  const navigate = (next: DirectoryFilters, replace = false) => {
    clearTimeout(timer.current);
    setState(previous => ({ ...previous, draft: next, submitted: directoryQuery(next) }));
    const destination = directoryUrl(next);
    if (isTranslationProxy(window.location.hostname)) {
      const language = new URLSearchParams(window.location.search).get("_x_tr_tl");
      window.location.assign(language ? proxyNavigationUrl(destination, language) ?? destination : destination);
      return;
    }
    startTransition(() => { if (replace) router.replace(destination, { scroll: false }); else router.push(destination, { scroll: false }); });
  };
  const update = (key: keyof DirectoryFilters, value: string) => {
    clearTimeout(timer.current);
    const next = { ...state.draft, [key]: value };
    setState(previous => ({ ...previous, draft: next }));
    if (key === "search") timer.current = setTimeout(() => navigate(next, true), 400);
    else navigate(next);
  };
  const reset = () => { navigate({ ...EMPTY_FILTERS }); search.current?.focus(); };
  const activeCount = Object.values(state.draft).filter(value => value.trim() !== "").length;
  const controls: { key: "gender" | "month" | "country" | "vocation" | "order"; label: string; all: string; options: string[]; unknown?: boolean }[] = [
    { key: "country", label: "Country or region", all: "Every place", options: options.country, unknown: true },
    { key: "gender", label: "Women and men", all: "Everyone", options: ["Female", "Male"] },
    { key: "month", label: "Feast month", all: "Every month", options: MONTHS, unknown: true },
    { key: "vocation", label: "Vocation or work", all: "Every vocation", options: options.vocation, unknown: true },
    { key: "order", label: "Religious order or family", all: "Every order", options: options.order, unknown: true },
  ];
  return <section aria-label="Saints directory"><form action="/resources" method="get" className="catalogue-layout" onClickCapture={event => { if ((event.target as HTMLElement).closest("a")) clearTimeout(timer.current); }} onSubmit={event => { event.preventDefault(); navigate(state.draft); }}>
    <noscript><style>{"#catalogue-filter-fields[data-expanded=false]{display:block!important}.catalogue-filter-toggle{display:none!important}"}</style></noscript>
    <aside className="catalogue-filters" aria-label="Directory filters">
      <h2>Find by life &amp; place</h2>
      <button type="button" className="catalogue-filter-toggle" aria-expanded={filtersOpen} aria-controls="catalogue-filter-fields" onClick={() => setFiltersOpen(!filtersOpen)}>Filters{activeCount ? ` (${activeCount})` : ""}<span aria-hidden>{filtersOpen ? "-" : "+"}</span></button>
      <div id="catalogue-filter-fields" data-expanded={filtersOpen}>
        <fieldset><legend className="sr-only">Refine the saint directory</legend>
          {controls.map(control => <div className="catalogue-field" key={control.key}><label htmlFor={`directory-${control.key}`}>{control.label}</label><select name={control.key} id={`directory-${control.key}`} value={state.draft[control.key]} onChange={event => update(control.key, event.target.value)}>
            <option value="">{control.all}</option>{control.options.map(value => <option key={value} value={value}>{value === "Female" ? "Women" : value === "Male" ? "Men" : value}</option>)}
            {control.unknown && <option value={UNCLASSIFIED}>{control.key === "month" ? "Feast not recorded" : "Not yet classified"}</option>}
          </select></div>)}
        </fieldset>
        <button className="catalogue-apply" type="submit">Apply filters</button>
        <p className="catalogue-help">Places reflect the biography, not modern nationality. Dates can vary by calendar. “Not yet classified” means research is still in progress.</p>
        <Link href="/editorial-policy">How we research these lives</Link>
      </div>
    </aside>
    <div className="catalogue-results" aria-busy={pending}>
      {state.draft.status && <input type="hidden" name="status" value={state.draft.status} />}
      <div className="catalogue-search"><label htmlFor="saint-search">Search the directory</label><div><input ref={search} id="saint-search" name="q" maxLength={100} type="search" value={state.draft.search} onChange={event => update("search", event.target.value)} placeholder="Name, place or patronage" /><button type="submit">Search</button>{state.draft.search && <button type="button" onClick={() => { navigate({ ...state.draft, search: "" }); search.current?.focus(); }} aria-label="Clear search">Clear</button>}</div></div>
      <div className="catalogue-result-summary"><p className="directory-count" role="status" aria-live="polite" aria-atomic="true"><span className="notranslate" translate="no">{total}</span>{" of "}<span className="notranslate" translate="no">{catalogueTotal}</span>{" saints"}{filters.search && <span>{" matching “"}<span className="notranslate" translate="no">{filters.search}</span>{"”"}</span>}{total > 0 && <small className="catalogue-page-count">Showing <span className="notranslate" translate="no">{offset + 1}–{offset + count}</span> · Page <span className="notranslate" translate="no" lang="en">{page} of {pages}</span></small>}</p>{activeCount > 0 && <Link href="/resources" className="catalogue-reset" onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); reset(); } }}>Clear all filters</Link>}</div>
      <p className="catalogue-updating" role="status">{pending ? "Updating saints…" : ""}</p>
      {children}
    </div>
  </form></section>;
}
