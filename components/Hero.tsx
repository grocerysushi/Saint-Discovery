"use client";
import DailySaintCard from "./DailySaintCard";
import LiturgicalBanner from "./LiturgicalBanner";
import type { DailySaint } from "@/lib/saint-of-day";
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function Hero({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return <div className="discovery-home site-width">
    <div className="discovery-intro">
      <div className="discovery-copy">
        <p className="gallery-intro-label">Faith has a history. Discover the people in it.</p>
        <h1 className="question-title">Find a saint whose story stays with you.</h1>
        <p className="discovery-lead">Get to know the saints through their lives, their struggles, and the faith that guided them.</p>
        <div className="discovery-actions"><Link href="/quiz" prefetch={false} onClick={() => track("homepage_quiz_click", { link_placement: "home_hero", content_version: "quiz_theme_v2" })} className="btn-primary">Take the saint quiz <span aria-hidden>→</span></Link><p className="discovery-note">Free to take<br />About 3–5 minutes</p></div>
        <Link prefetch={false} href="/resources" className="text-link gallery-explore-link" onClick={() => track("homepage_directory_click", { link_placement: "home_hero", content_version: "quiz_theme_v2" })}>Or explore the saints <span aria-hidden>↓</span></Link>
      </div>
      <DailySaintCard initialSaint={dailySaint} />
    </div>
    <section className="gallery-paths" aria-labelledby="gallery-paths-title">
      <div className="gallery-paths-intro"><p>Explore Saint Discovery</p><h2 id="gallery-paths-title">Begin wherever you are.</h2><p>Read a life, find a guide, or follow a question.</p></div>
      <Link prefetch={false} href="/resources"><span>Discover</span><h3>Meet the saints</h3><p>Browse the lives, sources and reflections behind the names.</p><strong>Explore the directory <span aria-hidden>→</span></strong></Link>
      <Link prefetch={false} href="/patron-saint-of"><span>Find</span><h3>A saint for your life</h3><p>Explore patron saints by cause, place or vocation.</p><strong>Browse patron saints <span aria-hidden>→</span></strong></Link>
      <Link prefetch={false} href="/confirmation-saint-guide"><span>Learn</span><h3>Go a little deeper</h3><p>Explore a thoughtful guide to choosing a Confirmation saint.</p><strong>Read the guide <span aria-hidden>→</span></strong></Link>
    </section>
    <details className="home-disclosure"><summary>Today in the Church</summary><div className="home-disclosure-content"><LiturgicalBanner /></div></details>
    <details className="home-disclosure"><summary>Search by name or patronage</summary><div className="home-disclosure-content">
    <section className="home-search-panel" aria-label="Find a saint"><div><h2>Whose story will you discover?</h2><p className="home-directory-total"><strong>{directoryCount}</strong> <Link prefetch={false} href="/resources">saint biographies to explore</Link></p></div><form action="/resources" className="home-directory-search" role="search"><label htmlFor="home-saint-search">Who would you like to discover?</label><div><input id="home-saint-search" name="q" type="search" placeholder="A name, place or patronage" /><button type="submit" className="btn-primary">Search saints</button></div></form></section>
    <nav className="home-reading-paths" aria-label="Ways to explore saints"><Link prefetch={false} href="/resources?gender=Female"><h2>Women of faith</h2><p>Explore the lives of women saints.</p><span aria-hidden>→</span></Link><Link prefetch={false} href="/resources?country=Korea"><h2>The Korean martyrs</h2><p>Meet the people behind the shared witness.</p><span aria-hidden>→</span></Link><Link prefetch={false} href="/patron-saint-of"><h2>A saint for your life</h2><p>Browse patron saints by work, place and need.</p><span aria-hidden>→</span></Link></nav>
    </div></details>
  </div>;
}
