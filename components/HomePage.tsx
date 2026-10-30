import HomeQuizInvitation from "@/components/HomeQuizInvitation";
import Image from "@/components/StaticImage";
import { getSaintArtwork } from "@/lib/saint-artwork";
import DailySaintCard from "@/components/DailySaintCard";
import LiturgicalBanner from "@/components/LiturgicalBanner";
import Link from "next/link";
import type { DailySaint } from "@/lib/saint-of-day";
import "./home-invitation.css";

const HOME_LIVES = [
  { slug: "therese-of-lisieux", name: "St. Thérèse of Lisieux", shortName: "Thérèse", theme: "Love in small things" },
  { slug: "francis-of-assisi", name: "St. Francis of Assisi", shortName: "Francis", theme: "A life of service" },
  { slug: "ignatius-of-loyola", name: "St. Ignatius of Loyola", shortName: "Ignatius", theme: "A change of direction" },
].map(saint => ({ ...saint, artwork: getSaintArtwork(saint) }));

export default function HomePage({ dailySaint, directoryCount }: { dailySaint: DailySaint | null; directoryCount: number }) {
  return (
    <div className="discovery-home-live home-invitation">
      <section className="home-welcome site-width" aria-labelledby="home-welcome-title">
        <div className="home-welcome-copy">
          <p className="home-welcome-note">Different lives. A shared faith.</p>
          <h1 id="home-welcome-title">Find your saint.<br />Discover their story.</h1>
          <p className="home-welcome-description">A free quiz to introduce you to a saint. Meet the person behind your match, then explore their story.</p>
          <HomeQuizInvitation />
          <p className="home-welcome-promise">21 questions · 3–5 minutes · No account needed</p>
          <Link prefetch={false} href="/resources" className="home-welcome-explore">Or explore the saints at your own pace <span aria-hidden>↗</span></Link>
        </div>
        <div className="home-lives-gallery">
          <div className="home-lives-art" aria-label="Three lives to discover">{HOME_LIVES.map((saint, i) => <figure key={saint.slug} className={`home-life home-life-${i}`}>
            <Link href={`/saints/${saint.slug}`} prefetch={false} aria-label={`Read the life of ${saint.name}`}><span className="home-life-image"><Image src={saint.artwork.src} alt={saint.artwork.alt} width={400} height={520} sizes="(max-width: 760px) 33vw, 22vw" priority={i === 1} /></span><span className="home-life-name">{saint.shortName}</span></Link>
            <figcaption>{saint.theme}</figcaption>
          </figure>)}</div>
          <div className="home-gallery-foot"><p>There is more than one way to live a life of faith.</p><details><summary>About the artwork</summary><ul>{HOME_LIVES.map(saint => <li key={saint.slug}><strong>{saint.name}.</strong> <a href={saint.artwork.source} target="_blank" rel="noopener noreferrer">{saint.artwork.credit} · Source</a>. {saint.artwork.licenseUrl ? <a href={saint.artwork.licenseUrl} target="_blank" rel="noopener noreferrer">{saint.artwork.license}</a> : saint.artwork.license}. Fitted and resized; not cropped.</li>)}</ul></details></div>
        </div>
      </section>
      <div className="discovery-home-extras"><DailySaintCard initialSaint={dailySaint} compact />
      <div className="site-width"><details className="home-disclosure"><summary>Search by name, place or patronage</summary><div className="home-disclosure-content"><p>{directoryCount} saint biographies to explore.</p><form action="/resources" className="home-directory-search" role="search"><label htmlFor="home-saint-search">Find a saint</label><div><input id="home-saint-search" name="q" type="search" placeholder="Name, place or patronage" /><button className="btn-primary" type="submit">Search saints</button></div></form><nav className="discovery-reading-links" aria-label="Ways to explore"><Link prefetch={false} href="/resources?gender=Female">Women of faith</Link><Link prefetch={false} href="/resources?country=Korea">The Korean martyrs</Link><Link prefetch={false} href="/patron-saint-of">Patron saints</Link><Link prefetch={false} href="/confirmation-saint-guide">Choosing a Confirmation saint</Link><Link prefetch={false} href="/blog/why-do-catholics-pray-to-saints">Why do Catholics pray to saints?</Link></nav></div></details><details className="home-disclosure"><summary>Today in the Church</summary><div className="home-disclosure-content"><LiturgicalBanner /></div></details></div></div>
    </div>
  );
}
