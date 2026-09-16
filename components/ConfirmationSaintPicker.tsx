"use client";

import { useState } from "react";
import Link from "next/link";
import { CONFIRMATION_THEMES, REFLECTION_PROMPTS } from "@/lib/confirmation-guide";

export interface ConfirmationCandidate {
  slug: string;
  name: string;
  theme: string;
  reason: string;
  description: string;
}

export default function ConfirmationSaintPicker({ candidates }: { candidates: ConfirmationCandidate[] }) {
  const [theme, setTheme] = useState<string>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const shortlist = selected.map(slug => candidates.find(candidate => candidate.slug === slug)!);

  function downloadWorksheet() {
    const body = [
      "MY CONFIRMATION SAINT REFLECTION", "Saint Discovery", "",
      "Discuss your choice and your parish’s requirements with your sponsor or catechist.", "",
      ...shortlist.flatMap(saint => [saint.name, `${window.location.origin}/saints/${saint.slug}`, "",
        ...REFLECTION_PROMPTS.flatMap((prompt, index) => [prompt, notes[`${saint.slug}-${index}`] || "____________________________", ""])]),
      "My next step: ____________________________",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-confirmation-saint-reflection.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <div className="guide-filters" role="group" aria-label="Explore saints by theme">
      {CONFIRMATION_THEMES.map(value => <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value}</button>)}
    </div>
    <p className="text-sm text-cream-dark mb-6" role="status">{theme === "All" ? candidates.length : candidates.filter(saint => saint.theme === theme).length} suggestions · {selected.length} of 3 shortlisted</p>
    <div className="guide-candidates">
      {candidates.filter(saint => theme === "All" || saint.theme === theme).map(saint => {
        const chosen = selected.includes(saint.slug);
        return <article key={saint.slug} className="guide-candidate">
          <p className="eyebrow">{saint.theme}</p>
          <h3>{saint.name}</h3><p className="text-gold">{saint.reason}</p>
          <p className="text-cream-dark">{saint.description}</p>
          <div className="guide-card-actions">
            <Link href={`/saints/${saint.slug}`} target="_blank" rel="noopener noreferrer" className="text-link">Read biography <span className="sr-only">(opens in a new tab)</span><span aria-hidden>↗</span></Link>
            <button type="button" className="btn-secondary" aria-pressed={chosen} aria-label={`${chosen ? "Remove" : "Shortlist"} ${saint.name}`} disabled={!chosen && selected.length >= 3} onClick={() => setSelected(current => chosen ? current.filter(slug => slug !== saint.slug) : current.length < 3 ? [...current, saint.slug] : current)}>{chosen ? "Remove" : "Shortlist +"}</button>
          </div>
        </article>;
      })}
    </div>
    <section id="my-shortlist" className="guide-shortlist" aria-labelledby="shortlist-title">
      <p className="eyebrow">Make it personal</p><h2 id="shortlist-title">Your shortlist &amp; reflection</h2>
      <p className="text-cream-dark">Choose up to three saints above, then compare what draws you to each life. Notes stay in this page only; download them before refreshing or leaving. Biographies open in a new tab.</p>
      {shortlist.length === 0 ? <p className="guide-empty">Your shortlist starts with one story that speaks to you.</p> : <>
        {shortlist.map(saint => <div key={saint.slug} className="guide-reflection">
          <div className="flex flex-wrap items-center justify-between gap-4"><h3>{saint.name}</h3><button className="text-link underline" type="button" onClick={() => setSelected(current => current.filter(slug => slug !== saint.slug))}>Remove<span className="sr-only"> {saint.name}</span></button></div>
          <div className="grid md:grid-cols-2 gap-5">{REFLECTION_PROMPTS.map((prompt, index) => {
            const key = `${saint.slug}-${index}`;
            return <div key={key}><label htmlFor={key} className="block mb-2 text-sm">{prompt}</label><textarea id={key} rows={3} maxLength={3000} value={notes[key] ?? ""} onChange={event => setNotes(current => ({ ...current, [key]: event.target.value }))} className="guide-notes" /></div>;
          })}</div>
        </div>)}
        <button className="btn-primary mt-6" type="button" onClick={downloadWorksheet}>Download my reflection (.txt) <span aria-hidden>↓</span></button>
      </>}
    </section>
  </>;
}
