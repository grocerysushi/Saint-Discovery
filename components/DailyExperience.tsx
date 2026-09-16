"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { localDateKey } from "@/lib/calendar-date";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DailyExperienceData } from "@/lib/daily-experience";

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
  const [completed, setCompleted] = useState<string[]>([]);
  const [imageFailed, setImageFailed] = useState(false);
  const [month, day] = daily.date.split("-").map(Number);
  const date = new Date(2024, month - 1, day);
  const previous = localDateKey(new Date(2024, month - 1, day - 1));
  const next = localDateKey(new Date(2024, month - 1, day + 1));
  const saint = daily.featured;
  const image = saint?.image;
  const name = saint ? saintDisplayName(saint) : null;
  const stages = [{ id: "read", label: "Read" }, { id: "reflect", label: "Reflect" }, { id: "pray", label: "Pray" }, { id: "act", label: "Act" }];

  return <>
    <header className="daily-page-heading"><div><p className="eyebrow">A little time for faith, every day</p><h1>Saint of the Day</h1><p>Read a life. Make space for prayer. Carry one good thing into your day.</p></div><p className="daily-date">{daily.label}<span>{followToday ? "Your daily pause" : "From the feast-day calendar"}</span></p></header>
    <nav className="daily-date-nav" aria-label="Browse daily reflections">
      <Link href={`/saint-of-day?date=${previous}`} aria-label={`Previous day, ${new Date(2024, month - 1, day - 1).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}>← Previous</Link>
      <Link href="/saint-of-day" aria-current={followToday ? "page" : undefined}>Today</Link>
      <form action="/saint-of-day" className="daily-date-form"><label htmlFor="daily-date">Choose a day</label><select name="date" id="daily-date" defaultValue={daily.date} aria-label="Choose a day in the annual feast-day calendar">{Array.from({ length: 366 }, (_, index) => { const choice = new Date(2024, 0, index + 1); const key = localDateKey(choice); return <option key={key} value={key}>{choice.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</option>; })}</select><button type="submit">Go</button></form>
      <Link href={`/saint-of-day?date=${next}`} aria-label={`Next day, ${new Date(2024, month - 1, day + 1).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}>Next →</Link>
    </nav>
    <section id="read" className="daily-story" aria-labelledby="daily-story-title">
      <figure className="daily-artwork">
        {image && !imageFailed ? <Image src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 480px" priority onError={() => setImageFailed(true)} /> : <div className="daily-artwork-fallback" aria-hidden>✦</div>}
        {image && !imageFailed && <figcaption>{image.generated ? "AI-generated illustration · Artistic interpretation" : <a href={image.source} target="_blank" rel="noopener noreferrer">{image.credit} · {image.license} ↗</a>}</figcaption>}
        {(!image || imageFailed) && <figcaption>{saint ? "Artwork unavailable. Read the story alongside it." : "A moment for reflection"}</figcaption>}
      </figure>
      <div className="daily-story-copy"><p className="eyebrow">01 · Read {saint?.kind === "observance" ? "· An observance" : "· A life to discover"}</p><h2 id="daily-story-title">{name ?? "A quiet day to keep growing"}</h2>
        {saint ? <>{daily.biography.map((paragraph, index) => <p key={index}>{paragraph}</p>)}<p className="daily-calendar-note">{daily.feastNote}</p>{saint.kind === "orthodox-saint" && <p className="daily-calendar-note">This figure is venerated in Orthodox Christianity.</p>}<Link href={`/saints/${saint.slug}`} className="text-link">Explore the biography &amp; sources <span aria-hidden>↗</span></Link></> : <><p>Our reviewed directory does not yet include an entry for {daily.label}. This is a gap in our coverage, not a claim that no saints are commemorated today.</p><p>You can still take a few minutes for the reflection below, or choose a life from the directory.</p><Link href="/resources" className="btn-secondary">Find a biography to read ↗</Link></>}
      </div>
    </section>
    <p className="daily-calendar-context">Dates follow the calendars noted in our biographies and can vary by place and tradition. This is a discovery guide, not the official liturgical calendar for your parish. The date browser includes February 29 for leap years.</p>
    <section className="daily-practice" aria-labelledby="practice-title"><div className="daily-practice-heading"><div><p className="eyebrow">Bring it into your day</p><h2 id="practice-title">{daily.reflection.theme}</h2><p>Original reflections and prayer prompts from Saint Discovery, not words attributed to {name ?? "a saint"}.</p></div><span className="daily-time">About 5 minutes</span></div>
      <div className="daily-practice-grid"><article id="reflect"><p className="eyebrow">02 · Reflect</p><h3>A question to sit with</h3><p>{daily.reflection.question}</p>{saint && <p>What detail in {name}’s story invites you to think differently about your own day?</p>}</article><article id="pray"><p className="eyebrow">03 · Pray</p><h3>Pause in God’s presence</h3><p className="daily-prayer">{daily.reflection.prayer}</p><p className="text-sm">Take a moment to add your own intention.</p></article><article id="act"><p className="eyebrow">04 · Act</p><h3>One small good thing</h3><p>{daily.reflection.action}</p></article></div>
      <div className="daily-progress"><div><h3>Your pause, at your pace</h3><p>Optional check-in for this visit. Nothing is saved or sent.</p></div><div className="daily-checks">{stages.map(stage => <label key={stage.id}><input type="checkbox" checked={completed.includes(stage.id)} onChange={event => setCompleted(current => event.target.checked ? [...current, stage.id] : current.filter(item => item !== stage.id))} />{stage.label}</label>)}</div><p role="status">{completed.length === 4 ? "Carry your reflection into the rest of your day." : `${completed.length} of 4 moments completed`}</p></div>
    </section>
    {daily.alsoToday.length > 0 && <section className="daily-more" aria-labelledby="also-today"><p className="eyebrow">More lives to explore</p><h2 id="also-today">Also remembered on {date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</h2><div>{daily.alsoToday.map(other => <Link key={other.slug} href={`/saints/${other.slug}`}>{other.name}<span aria-hidden>↗</span></Link>)}</div></section>}
    {daily.sources.length > 0 && <details className="daily-sources"><summary>Sources for today’s biography</summary><ul>{daily.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul></details>}
    <section className="daily-return"><p className="eyebrow">Let this become a small habit</p><h2>There is another story tomorrow.</h2><p>Bookmark this daily page to return. Or keep exploring a saint whose life speaks to yours.</p><div><Link href="/confirmation-saint-guide" className="btn-secondary">Choose a Confirmation saint ↗</Link><Link href="/quiz" className="text-link">Find your saint match ↗</Link></div></section>
  </>;
}
