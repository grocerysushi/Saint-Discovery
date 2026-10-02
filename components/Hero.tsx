"use client";
import Image from "next/image";
import DailySaintCard from "./DailySaintCard";
import LiturgicalBanner from "./LiturgicalBanner";
import type { DailySaint } from "@/lib/saint-of-day";
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function Hero({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return <div className="discovery-home site-width">
    <LiturgicalBanner />
    <div className="discovery-intro">
      <div className="discovery-copy question-card">
        <p className="eyebrow">Saint Discovery</p>
        <h1 className="question-title">Which Catholic<br />saint are you?</h1>
        <p className="discovery-lead">Meet a saint whose virtues connect with yours. Then discover the life, faith and courage behind the name.</p>
        <div className="discovery-actions"><Link href="/quiz" onClick={() => track("homepage_quiz_click", { link_placement: "home_hero", content_version: "quiz_theme_v2" })} className="btn-primary">Take the saint quiz <span aria-hidden>→</span></Link><Link href="/resources" className="text-link" onClick={() => track("homepage_directory_click", { link_placement: "home_hero", content_version: "quiz_theme_v2" })}>Explore the saints</Link></div>
        <p className="discovery-note">About 3–5 minutes. Free, with no account needed.</p>
      </div>
      <figure className="home-artwork">
        <Link href="/saints/francis-of-assisi" aria-label="Read the life of Saint Francis of Assisi"><Image src="/images/sacred-art.webp" width={600} height={634} sizes="(max-width: 760px) 90vw, 40vw" alt="El Greco’s painting of Saint Francis looking upward with his hands open" priority /></Link>
        <figcaption><Link href="/saints/francis-of-assisi">Saint Francis of Assisi</Link><p>El Greco, <cite>Saint Francis Receiving the Stigmata</cite>, 1585–1590.</p><a href="https://art.thewalters.org/object/37.424/">The Walters Art Museum · Public domain / CC0</a></figcaption>
      </figure>
    </div>
    <section className="home-search-panel" aria-label="Find a saint"><div><h2>Whose story will you discover?</h2><p className="home-directory-total"><strong>{directoryCount}</strong> <Link href="/resources">saint biographies to explore</Link></p></div><form action="/resources" className="home-directory-search" role="search"><label htmlFor="home-saint-search">Who would you like to discover?</label><div><input id="home-saint-search" name="q" type="search" placeholder="A name, place or patronage" /><button type="submit" className="btn-primary">Search saints</button></div></form></section>
    <nav className="home-reading-paths" aria-label="Ways to explore saints"><Link href="/resources?gender=Female"><h2>Women of faith</h2><p>Explore the lives of women saints.</p><span aria-hidden>→</span></Link><Link href="/resources?country=Korea"><h2>The Korean martyrs</h2><p>Meet the people behind the shared witness.</p><span aria-hidden>→</span></Link><Link href="/patron-saint-of"><h2>A saint for your life</h2><p>Browse patron saints by work, place and need.</p><span aria-hidden>→</span></Link></nav>
    <DailySaintCard initialSaint={dailySaint} />
  </div>;
}
