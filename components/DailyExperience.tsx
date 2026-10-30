"use client";

import { useEffect, useState } from "react";
import Image from "@/components/StaticImage";
import Link from "next/link";
import { localDateKey } from "@/lib/calendar-date";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DailyExperienceData } from "@/lib/daily-experience";
import DailyPause from "./DailyPause";

export default function DailyExperience({ initial, followToday }: { initial: DailyExperienceData; followToday: boolean }) {
  const [daily, setDaily] = useState(initial);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!followToday) return;
    let stopped = false;
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      const date = localDateKey();
      try {
        const response = await fetch(`/api/saint-of-day?date=${date}&experience=1`, { signal: requestController.signal });
        if (!response.ok) throw new Error("Daily experience unavailable");
        const payload = await response.json();
        if (!stopped && !requestController.signal.aborted && localDateKey() === date) { setDaily(payload.experience); setError(false); }
      } catch { if (!stopped && !requestController.signal.aborted) setError(true); }
    }
    function schedule() {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => { void refresh(); schedule(); }, midnight.getTime() - now.getTime() + 1000);
    }
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh(); schedule();
    document.addEventListener("visibilitychange", visible);
    return () => { stopped = true; controller?.abort(); clearTimeout(timer); document.removeEventListener("visibilitychange", visible); };
  }, [followToday]);
  return <>{error && <p role="status" className="daily-notice">Unable to refresh right now. Showing the available reflection for {daily.label}.</p>}<DailyContent key={daily.date} daily={daily} followToday={followToday} /></>;
}

function DailyContent({ daily, followToday }: { daily: DailyExperienceData; followToday: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [month, day] = daily.date.split("-").map(Number);
  const date = new Date(2024, month - 1, day);
  const previous = localDateKey(new Date(2024, month - 1, day - 1));
  const next = localDateKey(new Date(2024, month - 1, day + 1));
  const saint = daily.featured;
  const image = saint?.image;
  const name = saint ? saintDisplayName(saint) : null;

  return <>
    <header className="daily-page-heading"><div><h1>Saint of the Day</h1><p>A few quiet minutes. Read, reflect, pray, then carry one good thing into your day.</p></div></header>
    <DailyPause key={daily.date} daily={daily} name={name} artwork={
      <figure className="daily-artwork">
        <div className="daily-artwork-image">
        {image ? <Image src={imageFailed ? "/images/saint-symbolic.svg" : image.src} alt={imageFailed ? `Symbolic artwork for ${saint?.name}; not a portrait` : image.alt} fill sizes="(max-width: 760px) 100vw, 480px" priority onError={() => setImageFailed(true)} /> : <div className="daily-artwork-fallback" aria-hidden>✦</div>}
        </div>
        {image && <figcaption>{image.symbolic || imageFailed ? "Symbolic artwork · Not a portrait" : image.generated ? "AI-generated illustration · Artistic interpretation" : <a href={image.source} target="_blank" rel="noopener noreferrer">{image.credit} · {image.license} ↗</a>}</figcaption>}
        {!image && <figcaption>A moment for reflection</figcaption>}
      </figure>}>
      <div className="daily-story-copy">
        {saint ? <>{daily.biography.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<p className="daily-calendar-note">{daily.feastNote}</p>{saint.kind === "orthodox-saint" && <p className="daily-calendar-note">This figure is venerated in Orthodox Christianity.</p>}<Link prefetch={false} href={`/saints/${saint.slug}`} className="text-link">Explore the biography &amp; sources <span aria-hidden>↗</span></Link></> : <><p>Our reviewed directory does not yet include an entry for {daily.label}. This is a gap in our coverage, not a claim that no saints are commemorated today.</p><p>You can still take a few minutes for the reflection below, or choose a life from the directory.</p><Link prefetch={false} href="/resources" className="btn-secondary">Find a biography to read ↗</Link></>}
      </div>
    </DailyPause>
    <details className="daily-date-browser"><summary>Choose another day</summary>
    <nav className="daily-date-nav" aria-label="Browse daily reflections">
      <Link prefetch={false} href={`/saint-of-day?date=${previous}`} aria-label={`Previous day, ${new Date(2024, month - 1, day - 1).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}>← Previous</Link>
      <Link prefetch={false} href="/saint-of-day" aria-current={followToday ? "page" : undefined}>Today</Link>
      <form action="/saint-of-day" className="daily-date-form"><label htmlFor="daily-date">Choose a day</label><select name="date" id="daily-date" defaultValue={daily.date} aria-label="Choose a day in the annual feast-day calendar">{Array.from({ length: 366 }, (_, index) => { const choice = new Date(2024, 0, index + 1); const key = localDateKey(choice); return <option key={key} value={key}>{choice.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</option>; })}</select><button type="submit">Go</button></form>
      <Link prefetch={false} href={`/saint-of-day?date=${next}`} aria-label={`Next day, ${new Date(2024, month - 1, day + 1).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}>Next →</Link>
    </nav>
    </details>
    <p className="daily-calendar-context">When several saints share a date, this guide first favors saints on the <a href="https://www.usccb.org/committees/divine-worship/liturgical-calendar" target="_blank" rel="noopener noreferrer">USCCB’s U.S. calendar</a>, then other documented Catholic commemorations. Dates can vary by place and tradition. This is a discovery guide, not the official liturgical calendar for your parish; the liturgical banner follows the celebration for the year. The date browser includes February 29 for leap years.</p>
    {daily.alsoToday.length > 0 && <section className="daily-more" aria-labelledby="also-today"><p className="eyebrow">More lives to explore</p><h2 id="also-today">Also remembered on {date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2><div>{daily.alsoToday.map(other => <Link prefetch={false} key={other.slug} href={`/saints/${other.slug}`}>{other.name}<span aria-hidden>↗</span></Link>)}</div></section>}
    {daily.sources.length > 0 && <details className="daily-sources"><summary>Sources for today’s biography</summary><ul>{daily.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul></details>}
    <section className="daily-return"><p className="eyebrow">Let this become a small habit</p><h2>There is another story tomorrow.</h2><p>Bookmark this daily page to return. Or keep exploring a saint whose life speaks to yours.</p><div><Link prefetch={false} href="/confirmation-saint-guide" className="btn-secondary">Choose a Confirmation saint ↗</Link><Link href="/quiz" prefetch={false} className="text-link">Find your saint match ↗</Link></div></section>
  </>;
}
