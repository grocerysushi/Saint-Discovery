import HomeQuizInvitation from "@/components/HomeQuizInvitation";
import DailySaintCard from "@/components/DailySaintCard";
import LiturgicalBanner from "@/components/LiturgicalBanner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailySaint } from "@/lib/saint-of-day";
import type { ReactNode } from "react";
import "./concept15-home.css";

export default function HomePage({ dailySaint, directoryCount, afterWelcome }: { dailySaint: DailySaint | null; directoryCount: number; afterWelcome?: ReactNode }) {
  return <div className="concept15-home">
    <section className="c15-hero" aria-labelledby="home-welcome-title">
      <div className="c15-glass" aria-hidden="true" />
      <div className="c15-hero-content">
        <h1 id="home-welcome-title">Whose story<br />will speak to yours?</h1>
        <p className="c15-hero-copy">The saints lived wonderfully different lives. Discover one whose story, struggles, and gifts resonate with your own.</p>
        <HomeQuizInvitation />
        <p className="c15-hero-meta">21 questions · 3–5 minutes · Free, no account needed</p>
      </div>
      <div className="c15-scroll" aria-hidden="true">There’s more to discover</div>
    </section>
    <section className="c15-intro" aria-labelledby="c15-intro-title">
      <p className="c15-small">A little inspiration for your journey</p>
      <h2 id="c15-intro-title">There’s a saint for every kind of story</h2>
      <p>Some were bold. Some were quiet. Some took the long way around. Their lives remind us that holiness can take many forms—and that a story from long ago can still feel surprisingly close to home.</p>
      <div className="c15-ornament" aria-hidden="true"><span /></div>
    </section>
    <section className="c15-journey" aria-labelledby="c15-journey-title">
      <h2 id="c15-journey-title">From a few questions to a saint’s story</h2>
      <div className="c15-steps">
        <div className="c15-step"><b>1</b><h3>Share a little</h3><p>Answer 21 thoughtful questions about who you are and what matters to you.</p></div>
        <div className="c15-step"><b>2</b><h3>Meet your saint</h3><p>Discover a saint whose life and qualities connect with your answers.</p></div>
        <div className="c15-step"><b>3</b><h3>Explore their story</h3><p>Get to know their path and find inspiration for your own.</p></div>
      </div>
    </section>
    {afterWelcome}
    <div className="c15-extras"><DailySaintCard initialSaint={dailySaint} compact />
      <div className="site-width c15-search-area"><details className="home-disclosure"><summary>Search by name, place or patronage</summary><div className="home-disclosure-content"><p>{directoryCount} saint biographies to explore.</p>
        <form action="/resources" className="home-directory-search" role="search" data-traceleaf-event="directory_search">
          <Label htmlFor="home-saint-search" className="leading-[inherit]">Find a saint</Label>
          <div><Input id="home-saint-search" name="q" type="search" placeholder="Name, place or patronage" className="h-auto" /><Button variant="gold" size="cta" type="submit">Search saints</Button></div>
        </form>
        <nav className="discovery-reading-links" aria-label="Ways to explore"><Link prefetch={false} href="/resources?gender=Female">Women of faith</Link><Link prefetch={false} href="/resources?country=Korea">The Korean martyrs</Link><Link prefetch={false} href="/patron-saint-of">Patron saints</Link><Link prefetch={false} href="/confirmation-saint-guide">Choosing a Confirmation saint</Link><Link prefetch={false} href="/blog/why-do-catholics-pray-to-saints">Why do Catholics pray to saints?</Link></nav></div></details><details className="home-disclosure"><summary>Today in the Church</summary><div className="home-disclosure-content"><LiturgicalBanner /></div></details>
      </div>
    </div>
    <section className="c15-explore" aria-labelledby="c15-explore-title">
      <div className="c15-explore-top"><h2 id="c15-explore-title">More ways to explore the saints</h2><p>Whether you’re curious, preparing for Confirmation, or looking for a little daily inspiration, there’s more to explore.</p></div>
      <div className="c15-links">
        <Link href="/saint-of-day"><strong>Saint of the day</strong><span>A new saint’s story every day</span><span aria-hidden="true">→</span></Link>
        <Link href="/confirmation-saint-guide"><strong>Confirmation saint guide</strong><span>Find a companion for your Confirmation</span><span aria-hidden="true">→</span></Link>
        <Link href="/patron-saint-of"><strong>Explore patron saints</strong><span>Saints for professions, places and causes</span><span aria-hidden="true">→</span></Link>
        <Link href="/resources"><strong>Saints directory</strong><span>Sourced biographies, searchable by name and place</span><span aria-hidden="true">→</span></Link>
        <Link href="/resources/teachers"><strong>Teachers and catechists</strong><span>Worksheets and lesson guides to download</span><span aria-hidden="true">→</span></Link>
        <Link href="/blog"><strong>Journal</strong><span>Articles about faith and the saints</span><span aria-hidden="true">→</span></Link>
      </div>
    </section>
    <section className="c15-closing"><h2>Ready to meet your saint?</h2><p>Start with a few questions and discover a story that might stay with you.</p><HomeQuizInvitation /></section>
  </div>;
}
