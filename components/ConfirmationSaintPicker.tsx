"use client";

import { useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CONFIRMATION_THEMES, REFLECTION_PROMPTS } from "@/lib/confirmation-guide";
import SaintArtworkFigure from "@/components/SaintArtwork";
import type { SaintArtwork } from "@/lib/saint-artwork";
import "./confirmation-workspace.css";

export interface ConfirmationCandidate {
  slug: string;
  name: string;
  theme: string;
  reason: string;
  description: string;
  artwork: SaintArtwork;
}

export default function ConfirmationSaintPicker({ candidates }: { candidates: ConfirmationCandidate[] }) {
  const [theme, setTheme] = useState<string>("Service");
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const reflectionHeading = useRef<HTMLHeadingElement>(null);
  const [downloaded, setDownloaded] = useState(false);
  const shortlist = selected.map(slug => candidates.find(candidate => candidate.slug === slug)!);

  function compare() {
    reflectionHeading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    reflectionHeading.current?.focus({ preventScroll: true });
  }

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
    setDownloaded(true);
  }

  return <div className="confirmation-workspace">
    <noscript><style>{".workspace-life[hidden]{display:flex!important}.workspace-themes,.workspace-status-row,.workspace-tray,.workspace-life-actions button{display:none!important}"}</style><p>Read all the suggestions below. For a reflection without JavaScript, use the <a href="/resources/teachers">printable saint-reflection worksheet</a>.</p></noscript>
    <div className="workspace-toolbar"><div><h3>What would you like to grow in?</h3><p>These are reading suggestions, not official patronages or rankings.</p></div><Link href="/resources" prefetch={false}>Browse all saints ↗</Link></div>
    <div className="workspace-themes" role="group" aria-label="Explore saints by theme">{CONFIRMATION_THEMES.map(value => <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value === "All" ? "All suggestions" : value}</button>)}</div>
    <div className="workspace-status-row"><p className="workspace-status" role="status">{theme === "All" ? candidates.length : candidates.filter(saint => saint.theme === theme).length} suggestions · {selected.length} of 3 shortlisted{selected.length === 3 ? ". Your shortlist is full. Remove a saint to add another." : ""}</p>{selected.length > 0 && <button type="button" className="workspace-mobile-compare" onClick={compare}>Reflect on my shortlist ↓</button>}</div>
    <div className="workspace-browse">
      <div className="workspace-lives">{candidates.map(saint => {
        const chosen = selected.includes(saint.slug);
        return <article key={saint.slug} className="workspace-life" hidden={theme !== "All" && saint.theme !== theme} data-chosen={chosen || undefined}>
          <SaintArtworkFigure artwork={saint.artwork} name={saint.name} />
          <h3>{saint.name}</h3><p className="workspace-reason">{saint.reason}</p>
          <details><summary>A little of this life</summary><p>{saint.description}</p></details>
          <div className="workspace-life-actions"><Link prefetch={false} href={`/saints/${saint.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`Read ${saint.name}’s biography (opens in a new tab)`}>Read biography ↗</Link>
            <button type="button" aria-pressed={chosen} aria-label={`${chosen ? "Remove" : "Shortlist"} ${saint.name}`} disabled={!chosen && selected.length >= 3} onClick={() => { setSelected(current => chosen ? current.filter(slug => slug !== saint.slug) : current.length < 3 ? [...current, saint.slug] : current); setDownloaded(false); }}>{chosen ? "Added ✓" : "Shortlist +"}</button>
          </div>
        </article>;
      })}</div>
      <aside className="workspace-tray" aria-labelledby="tray-title">
        <p>For your conversation with your sponsor</p><h3 id="tray-title">A few lives.<br />A thoughtful choice.</h3>
        <ol>{Array.from({ length: 3 }, (_, i) => {
          const saint = shortlist[i];
          return <li key={i} data-filled={Boolean(saint)}><span className="workspace-slot" aria-hidden>{i + 1}</span>{saint ? <><span>{saint.name}</span><button type="button" aria-label={`Remove ${saint.name} from your shortlist`} onClick={() => { setSelected(current => current.filter(slug => slug !== saint.slug)); setDownloaded(false); }}>×</button></> : <span>{i === 0 ? "Start with one life" : i === 1 ? "Add another to compare" : "A third, if helpful"}</span>}</li>;
        })}</ol>
        <button type="button" className="workspace-compare" onClick={compare} disabled={!selected.length}>{selected.length > 1 ? "Compare & reflect" : selected.length === 1 ? "Reflect on this life" : "Choose a saint to begin"}</button>
        <p>Read the biographies first. Your shortlist is a starting point, not a final decision.</p>
        <small>No account needed. Your selections and notes stay in this page only; download before leaving or refreshing.</small>
      </aside>
    </div>
    <section id="my-shortlist" className="workspace-reflection" aria-labelledby="shortlist-title">
      <div className="workspace-reflection-heading"><div><p>Your shortlist &amp; reflection</p><h2 id="shortlist-title" ref={reflectionHeading} tabIndex={-1}>Bring a story to the conversation.</h2></div>{shortlist.length > 0 && <button className="btn-primary" type="button" onClick={downloadWorksheet}>Download my reflection (.txt) ↓</button>}</div>
      <p>Use an event you can trace to the biography’s sources. Keep personal details out of your notes, especially on a shared device. Nothing you type here is sent to us.</p>
      {shortlist.length === 0 ? <div className="workspace-empty"><h3>One life is enough to begin.</h3><p>Add a saint above to open four reflection prompts. You can compare up to three, then download your notes for a conversation with your sponsor.</p><a href="#explore-saints">Explore the suggestions ↑</a></div> : <>
        <div className="workspace-comparison" style={{ "--shortlist-count": shortlist.length } as CSSProperties}>
          {shortlist.map(saint => <div className="workspace-column-name" key={saint.slug}><h3>{saint.name}</h3><Link href={`/saints/${saint.slug}`} prefetch={false} target="_blank" rel="noopener noreferrer">Return to biography <span className="sr-only">(opens in a new tab)</span>↗</Link></div>)}
          {REFLECTION_PROMPTS.map((prompt, index) => shortlist.map(saint => {
            const key = `${saint.slug}-${index}`;
            return <div className="workspace-note" key={key}><label htmlFor={key}><span className="workspace-mobile-name">{saint.name}</span>{prompt}</label><textarea id={key} aria-label={`${saint.name}: ${prompt}`} rows={4} maxLength={3000} value={notes[key] ?? ""} onChange={event => { setNotes(current => ({ ...current, [key]: event.target.value })); setDownloaded(false); }} /></div>;
          }))}
        </div>
        <p className="workspace-next-step">Bring these notes to your sponsor or catechist. Confirm the name and any assignment requirements with your parish.</p>
        <button className="btn-primary" type="button" onClick={downloadWorksheet}>Download my reflection (.txt) ↓</button>
        <p role="status" className="workspace-download-status">{downloaded ? "Download started. Check your downloads for my-confirmation-saint-reflection.txt." : "Download before refreshing or leaving. Your notes are not saved between visits."}</p>
      </>}
    </section>
  </div>;
}
