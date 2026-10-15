"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { localDateKey, subscribeToLocalDate } from "@/lib/calendar-date";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DirectoryDailyCard } from "@/lib/directory-shared";

const serverDate = () => null;

export default function DirectoryDailySaints() {
  // The cached server page cannot know the visitor's date. Keep its heading and
  // daily-page link discoverable without presenting the server's date as today.
  const date = useSyncExternalStore(subscribeToLocalDate, localDateKey, serverDate);
  const [data, setData] = useState<{ date: string; saints: DirectoryDailyCard[]; failed: boolean }>({ date: "", saints: [], failed: false });
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch(`/api/saint-of-day?date=${date}&directory=1`, { signal: controller.signal });
        if (!response.ok) throw new Error("Daily saints unavailable");
        const result = await response.json();
        if (!controller.signal.aborted) setData({ date: date!, saints: result.saints, failed: false });
      } catch {
        if (!controller.signal.aborted) setData({ date: date!, saints: [], failed: true });
      }
    }
    void refresh();
    return () => controller.abort();
  }, [date]);
  const [month, day] = date?.split("-").map(Number) ?? [];
  const label = date ? new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : null;
  const loaded = data.date === date;
  const dailySaints = loaded ? data.saints : [];

  return <section className="directory-support" aria-labelledby="directory-daily-title">
    {label && <p className="eyebrow mb-3">{label}</p>}
    <h2 id="directory-daily-title">Saint of the day</h2>
    {date && !loaded && <p role="status">Loading today’s saints…</p>}
    {loaded && data.failed && <p>Today’s saints could not be loaded. You can still visit the daily reflection.</p>}
    <div className="grid gap-4">{dailySaints.map(saint => <Link key={saint.slug} href={`/saints/${saint.slug}`} className="result-panel">
      <h3 className="text-2xl mb-2">{saintDisplayName(saint)} <span className="text-gold" aria-hidden>↗</span></h3>
      {saint.tagline && <p className="text-gold italic mb-3">{saint.tagline}</p>}
      {saint.description && <p className="text-cream-dark leading-relaxed">{saint.description}</p>}
    </Link>)}</div>
    {label && loaded && !data.failed && dailySaints.length === 0 && <p className="text-cream-dark">Our directory does not yet include an entry for {label}. You can still visit the daily reflection.</p>}
    <p className="mt-5"><Link href="/saint-of-day" className="text-link">Read today’s reflection →</Link></p>
  </section>;
}
