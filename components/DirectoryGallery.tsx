"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import SaintArtworkFigure from "@/components/SaintArtwork";
import type { SaintArtwork } from "@/lib/saint-artwork";
import "./directory-gallery.css";

export type GalleryPath = {
  title: string; question: string; href: string;
  saints: { name: string; slug: string; description: string; artwork: SaintArtwork }[];
};

const invitations = ["Who helps us find our way?", "Where does prayer fit in a full life?", "What can another voice teach us?", "What does it mean to serve?"];

export default function DirectoryGallery({ paths, total, defaultBrowse, children }: {
  paths: GalleryPath[]; total: number; defaultBrowse: boolean; children: ReactNode;
}) {
  const [browse, setBrowse] = useState(defaultBrowse);
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const path = paths[selected];
  const modes = ["Discover a life", `Search all ${total} saints`];
  return <div className="directory-gallery">
    <header className="gallery-directory-heading">
      <div><p>The saints directory</p><h1>A life for every question.</h1></div>
      <p>Start with something that matters to you. Meet the people behind the names.</p>
    </header>
    <div className="gallery-directory-modes" role="tablist" aria-label="How to explore the saints">
      {modes.map((label, i) => <button key={label} ref={node => { tabs.current[i] = node; }} type="button" role="tab" id={`directory-mode-${i}`} aria-controls={`directory-view-${i}`} aria-selected={Number(browse) === i} tabIndex={Number(browse) === i ? 0 : -1}
        onClick={() => setBrowse(Boolean(i))} onKeyDown={event => {
          if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - i;
          setBrowse(Boolean(next)); tabs.current[next]?.focus();
        }}>{label}<span aria-hidden>{i ? "⌕" : "✣"}</span></button>)}
    </div>
    <section id="directory-view-0" role="tabpanel" aria-labelledby="directory-mode-0" hidden={browse} tabIndex={0}>
      <div className="gallery-discovery-stage">
        <div className="gallery-questions">
          <h2>Follow a question.</h2>
          <div role="group" aria-label="Choose a reading question">{paths.map((item, i) => <button key={item.title} type="button" aria-pressed={selected === i} aria-controls="gallery-chosen-path" onClick={() => setSelected(i)}><span>{invitations[i] ?? item.title}</span><small>{item.title}</small><span className="gallery-question-arrow" aria-hidden>↗</span></button>)}</div>
          <p>Curated reading paths, not quiz matches.</p>
          <Link href="/quiz" prefetch={false}>Prefer a personal starting point? Take the quiz.</Link>
        </div>
        {path && <div className="gallery-chosen-path" id="gallery-chosen-path">
          <p className="sr-only" role="status">Selected: {path.title}. {path.saints.map(saint => saint.name).join(" and ")}.</p>
          <div className="gallery-lives">{path.saints.map(saint => <article key={saint.slug}>
            <SaintArtworkFigure artwork={saint.artwork} name={saint.name} />
            <h3><Link href={`/saints/${saint.slug}`} prefetch={false}>{saint.name}</Link></h3>
            <p>{saint.description}</p>
            <Link className="gallery-life-link" href={`/saints/${saint.slug}`} prefetch={false} aria-label={`Read the biography of ${saint.name}`}>Read the biography <span aria-hidden>↗</span></Link>
          </article>)}</div>
          <div className="gallery-reading-prompt"><div><h3>Read them together.</h3><p>{path.question}</p></div><Link href={path.href} prefetch={false}>Open the reading path <span aria-hidden>↗</span></Link></div>
        </div>}
      </div>
    </section>
    <section id="directory-view-1" role="tabpanel" aria-labelledby="directory-mode-1" hidden={!browse} tabIndex={0}>{children}</section>
    <noscript><style>{"#directory-view-1[hidden]{display:block!important}.gallery-directory-modes{display:none!important}"}</style></noscript>
  </div>;
}
