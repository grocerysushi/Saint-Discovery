"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import SaintCompanion from "./SaintCompanion";
import Image from "./StaticImage";

export default function DiscoverySample() {
  const [view, setView] = useState("life");
  const dialog = useRef<HTMLDialogElement>(null);
  return <aside className="discovery-sample" aria-label="Example saint discovery">
    <div className="sample-heading"><h2>Find more than<br />a name.</h2><p>Meet a life. Make a connection.<br />Carry something into your day.</p></div>
    <article className="sample-card"><div className="sample-label">Example discovery <span>Not your quiz result</span></div>
      <div className="sample-portrait"><Image src="/images/sacred-art.webp" alt="El Greco’s Saint Francis Receiving the Stigmata" sizes="(max-width: 760px) 40vw, 22vw" width={400} height={480} priority /><div><small>Assisi, Italy</small><h3>St. Francis<br />of Assisi</h3><p>A different kind<br />of richness.</p></div></div>
      <div className="sample-tabs" role="group" aria-label="Explore this example">{[["life", "His life"], ["reflect", "Reflect"], ["act", "Try today"]].map(([id, label]) => <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}</div>
      <div className="sample-copy" aria-live="polite">{view === "life" ? <><h3>He changed what mattered.</h3><p>Francis turned from wealth and military ambition toward a life of Gospel poverty and fraternity. He founded the Order of Friars Minor.</p><Link prefetch={false} href="/saints/francis-of-assisi">Read the life behind the name ↗</Link></> : view === "reflect" ? <><h3>What could you make room for?</h3><p>Think of one habit or possession you could simplify. What responsibility or relationship might receive more of your attention?</p><small>An original reflection from Saint Discovery.</small></> : <><h3>Let one small thing become service.</h3><p>Choose a useful possession you no longer need. Check whether a local charity can use it, and arrange to give it thoughtfully.</p><small>An original suggestion, not a quotation or religious obligation.</small></>}</div>
      <p className="sample-credit">El Greco, <cite>Saint Francis Receiving the Stigmata</cite>.<br /><a href="https://art.thewalters.org/object/37.424/" target="_blank" rel="noopener noreferrer">The Walters Art Museum</a>. Public domain. Fitted, uncropped.</p>
    </article>
    <button type="button" className="sample-preview" onClick={() => dialog.current?.showModal()}>Preview the three-day companion ↗</button>
    <dialog ref={dialog} className="discovery-dialog" aria-labelledby="sample-companion-title"><button className="dialog-close" type="button" onClick={() => dialog.current?.close()} aria-label="Close example companion">×</button><p>Example companion · Not a quiz result</p><h2 id="sample-companion-title">St. Francis of Assisi</h2><SaintCompanion name="St. Francis of Assisi" slug="francis-of-assisi" /><button type="button" className="btn-primary" onClick={() => dialog.current?.close()}>Return to the quiz</button></dialog>
  </aside>;
}
