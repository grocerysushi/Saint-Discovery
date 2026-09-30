"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { localDateKey, subscribeToLocalDate } from "@/lib/calendar-date";
import { saintDisplayName } from "@/lib/saint-seo";
import type { Saint } from "@/lib/types";

const serverDate = () => null;

export default function DirectoryDailySaints({ saints }: { saints: Saint[] }) {
  // The cached server page cannot know the visitor's date. Keep its heading and
  // daily-page link discoverable without presenting the server's date as today.
  const date = useSyncExternalStore(subscribeToLocalDate, localDateKey, serverDate);
  const [month, day] = date?.split("-").map(Number) ?? [];
  const label = date ? new Date(2024, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : null;
  const dailySaints = label ? saints.filter(saint => saint.feast_day?.trim() === label) : [];

  return <section className="directory-support" aria-labelledby="directory-daily-title">
    {label && <p className="eyebrow mb-3">{label}</p>}
    <h2 id="directory-daily-title">Saint of the day</h2>
    <div className="grid gap-4">{dailySaints.map(saint => <Link key={saint.id} href={`/saints/${saint.slug}`} className="result-panel">
      <h3 className="text-2xl mb-2">{saintDisplayName(saint)} <span className="text-gold" aria-hidden>↗</span></h3>
      {saint.tagline && <p className="text-gold italic mb-3">{saint.tagline}</p>}
      {saint.description && <p className="text-cream-dark leading-relaxed">{saint.description}</p>}
    </Link>)}</div>
    {label && dailySaints.length === 0 && <p className="text-cream-dark">Our directory does not yet include an entry for {label}. You can still visit the daily reflection.</p>}
    <p className="mt-5"><Link href="/saint-of-day" className="text-link">Read today’s reflection →</Link></p>
  </section>;
}
