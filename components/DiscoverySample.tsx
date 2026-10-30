"use client";
import { useRef } from "react";
import Link from "next/link";
import SaintCompanion from "./SaintCompanion";
import Image from "./StaticImage";

export default function DiscoverySample() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <aside className="encounter-gallery" aria-label="A life to discover">
    <figure className="encounter-art">
      <div className="encounter-canvas"><Image src="/images/sacred-art.webp" alt="El Greco’s Saint Francis Receiving the Stigmata" sizes="(max-width: 760px) 90vw, 48vw" width={400} height={480} priority /></div>
      <figcaption>
        <div className="encounter-caption"><div><span>A life turned toward others</span><h2>Francis of Assisi</h2></div><Link prefetch={false} href="/saints/francis-of-assisi" aria-label="Read the life of St. Francis of Assisi">Read his life <span aria-hidden>↗</span></Link></div>
        <p className="encounter-credit">El Greco, <cite>Saint Francis Receiving the Stigmata</cite>. <a href="https://art.thewalters.org/object/37.424/" target="_blank" rel="noopener noreferrer">The Walters Art Museum</a>. Public domain. Fitted, uncropped.</p>
      </figcaption>
    </figure>
    <button type="button" className="encounter-preview" onClick={() => dialog.current?.showModal()}>See what comes after your match <span aria-hidden>↗</span></button>
    <dialog ref={dialog} className="discovery-dialog" aria-labelledby="sample-companion-title"><button className="dialog-close" type="button" onClick={() => dialog.current?.close()} aria-label="Close example companion">×</button><p>Example companion · Not a quiz result</p><h2 id="sample-companion-title">St. Francis of Assisi</h2><SaintCompanion name="St. Francis of Assisi" slug="francis-of-assisi" /><button type="button" className="btn-primary" onClick={() => dialog.current?.close()}>Return to the quiz</button></dialog>
  </aside>;
}
