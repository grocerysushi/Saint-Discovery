"use client";
import Image from "next/image";
import DailySaintCard from "./DailySaintCard";
import type { DailySaint } from "@/lib/saint-of-day";
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function Hero({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return <div className="discovery-home site-width">
    <div className="discovery-intro">
      <div className="discovery-copy">
        <h1>Get to know<br />the saints.</h1>
        <p className="discovery-lead">Lives of faith, courage and ordinary kindness. Find a familiar name, or meet someone new.</p>
        <form action="/resources" className="home-directory-search" role="search">
          <label htmlFor="home-saint-search">Who would you like to discover?</label>
          <div><input id="home-saint-search" name="q" type="search" placeholder="A name, place or patronage" /><button type="submit" className="btn-primary">Search saints</button></div>
        </form>
        <p className="home-directory-total"><strong>{directoryCount}</strong> <Link href="/resources" onClick={() => track("homepage_directory_click", { link_placement: "home_hero", content_version: "reading_library_v1" })}>saint biographies to explore</Link></p>
        <div className="home-quiz-invitation"><h2>Which Catholic saint are you?</h2><p>Start with the free quiz. Your answers introduce you to a saint whose virtues connect with yours.</p><Link href="/quiz" onClick={() => track("homepage_quiz_click", { link_placement: "home_hero", content_version: "reading_library_v1" })} className="btn-secondary">Take the saint quiz</Link><span>About 3–5 minutes. No account needed.</span></div>
      </div>
      <figure className="home-artwork">
        <Link href="/saints/francis-of-assisi" aria-label="Read the life of Saint Francis of Assisi"><Image src="/images/sacred-art.webp" width={600} height={634} sizes="(max-width: 760px) 90vw, 40vw" alt="El Greco’s painting of Saint Francis looking upward with his hands open" priority /></Link>
        <figcaption><Link href="/saints/francis-of-assisi">Saint Francis of Assisi</Link><p>El Greco, <cite>Saint Francis Receiving the Stigmata</cite>, 1585–1590.</p><a href="https://art.thewalters.org/object/37.424/">The Walters Art Museum. Public domain / CC0.</a></figcaption>
      </figure>
    </div>
    <DailySaintCard initialSaint={dailySaint} />
    <nav className="home-reading-paths" aria-label="Ways to explore saints"><Link href="/resources?gender=Female"><h2>Women of faith</h2><p>Explore the lives of women saints.</p></Link><Link href="/resources?country=Korea"><h2>The Korean martyrs</h2><p>Meet the people behind the shared witness.</p></Link><Link href="/patron-saint-of"><h2>A saint for your life</h2><p>Browse patron saints by work, place and need.</p></Link></nav>
  </div>;
}
