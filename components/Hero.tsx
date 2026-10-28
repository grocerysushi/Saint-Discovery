"use client";
import DailySaintCard from "./DailySaintCard";
import LiturgicalBanner from "./LiturgicalBanner";
import type { DailySaint } from "@/lib/saint-of-day";
import Link from "next/link";
import { track } from "@/lib/analytics";
import "./home-vision.css";

export default function Hero({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return <div className="discovery-home site-width">
    <div className="vision-hero">
      <div className="discovery-copy">
        <h1>Which saint’s story speaks to yours?</h1>
        <p className="discovery-lead">Explore lives of faith and find a saint to walk with you.</p>
        <div className="discovery-actions"><Link href="/quiz" prefetch={false} onClick={() => track("homepage_quiz_click", { link_placement: "home_hero", content_version: "quiz_theme_v2" })} className="btn-primary">Find your saint <span aria-hidden>→</span></Link><p className="discovery-note">Free · About 3–5 minutes</p></div>
      </div>
      <figure className="vision-hero-art">
        {/* The whole work is shown; this is a historical painting, not a portrait. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/sacred-art.webp" alt="El Greco’s painting of Saint Francis receiving the stigmata" />
        <figcaption>El Greco, <cite>Saint Francis Receiving the Stigmata</cite> · <a href="https://art.thewalters.org/object/37.424/" target="_blank" rel="noopener noreferrer">The Walters Art Museum</a> · Public domain</figcaption>
      </figure>
    </div>
    <section className="gallery-paths" aria-labelledby="gallery-paths-title">
      <h2 id="gallery-paths-title" className="sr-only">Explore Saint Discovery</h2>
      <Link prefetch={false} href="/resources" onClick={() => track("homepage_directory_click", { link_placement: "home_paths", content_version: "quiz_theme_v2" })}><h3>Discover the saints <span aria-hidden>→</span></h3><p>Meet people of faith from every time and place.</p></Link>
      <Link prefetch={false} href="/patron-saint-of"><h3>Find a patron saint <span aria-hidden>→</span></h3><p>Explore patron saints by cause, place or vocation.</p></Link>
      <Link prefetch={false} href="/confirmation-saint-guide"><h3>Choose a Confirmation saint <span aria-hidden>→</span></h3><p>Find a thoughtful place to begin your search.</p></Link>
    </section>
    <section className="vision-daily" aria-label="Saint of the Day">
      <div className="vision-section-heading"><p>A life for today</p><h2>Saint of the Day</h2><p>Make a little space for a story, reflection and prayer.</p></div>
      <DailySaintCard initialSaint={dailySaint} />
    </section>
    <section className="vision-reading" aria-labelledby="vision-reading-title">
      <div><p className="eyebrow">Stories for your journey</p><h2 id="vision-reading-title">Guides and reflections</h2></div>
      <div className="vision-reading-links">
        <Link prefetch={false} href="/confirmation-saint-guide"><h3>How to choose a Confirmation saint</h3><p>Consider the lives and virtues that invite you to grow.</p><span>Read the guide →</span></Link>
        <Link prefetch={false} href="/blog/why-do-catholics-pray-to-saints"><h3>Why do Catholics pray to saints?</h3><p>Explore what Catholics mean when they ask the saints to pray with them.</p><span>Read the article →</span></Link>
      </div>
    </section>
    <details className="home-disclosure"><summary>Today in the Church</summary><div className="home-disclosure-content"><LiturgicalBanner /></div></details>
    <details className="home-disclosure"><summary>Search by name or patronage</summary><div className="home-disclosure-content">
    <section className="home-search-panel" aria-label="Find a saint"><div><h2>Whose story will you discover?</h2><p className="home-directory-total"><strong>{directoryCount}</strong> <Link prefetch={false} href="/resources">saint biographies to explore</Link></p></div><form action="/resources" className="home-directory-search" role="search"><label htmlFor="home-saint-search">Who would you like to discover?</label><div><input id="home-saint-search" name="q" type="search" placeholder="A name, place or patronage" /><button type="submit" className="btn-primary">Search saints</button></div></form></section>
    <nav className="home-reading-paths" aria-label="Ways to explore saints"><Link prefetch={false} href="/resources?gender=Female"><h2>Women of faith</h2><p>Explore the lives of women saints.</p><span aria-hidden>→</span></Link><Link prefetch={false} href="/resources?country=Korea"><h2>The Korean martyrs</h2><p>Meet the people behind the shared witness.</p><span aria-hidden>→</span></Link><Link prefetch={false} href="/patron-saint-of"><h2>A saint for your life</h2><p>Browse patron saints by work, place and need.</p><span aria-hidden>→</span></Link></nav>
    </div></details>
  </div>;
}
