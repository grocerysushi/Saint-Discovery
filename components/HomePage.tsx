import QuizExperience from "@/components/QuizExperience";
import DailySaintCard from "@/components/DailySaintCard";
import LiturgicalBanner from "@/components/LiturgicalBanner";
import Link from "next/link";
import type { DailySaint } from "@/lib/saint-of-day";

export default function HomePage({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return (
    <div className="discovery-home-live">
      <QuizExperience home />
      <div className="discovery-home-extras"><DailySaintCard initialSaint={dailySaint} compact />
      <div className="site-width"><details className="home-disclosure"><summary>Search by name, place or patronage</summary><div className="home-disclosure-content"><p>{directoryCount} saint biographies to explore.</p><form action="/resources" className="home-directory-search" role="search"><label htmlFor="home-saint-search">Find a saint</label><div><input id="home-saint-search" name="q" type="search" placeholder="Name, place or patronage" /><button className="btn-primary" type="submit">Search saints</button></div></form><nav className="discovery-reading-links" aria-label="Ways to explore"><Link prefetch={false} href="/resources?gender=Female">Women of faith</Link><Link prefetch={false} href="/resources?country=Korea">The Korean martyrs</Link><Link prefetch={false} href="/patron-saint-of">Patron saints</Link><Link prefetch={false} href="/confirmation-saint-guide">Choosing a Confirmation saint</Link><Link prefetch={false} href="/blog/why-do-catholics-pray-to-saints">Why do Catholics pray to saints?</Link></nav></div></details><details className="home-disclosure"><summary>Today in the Church</summary><div className="home-disclosure-content"><LiturgicalBanner /></div></details></div></div>
    </div>
  );
}
