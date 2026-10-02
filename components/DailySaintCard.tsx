"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DailySaint } from "@/lib/saint-of-day";
import { localDateKey } from "@/lib/calendar-date";

export default function DailySaintCard({ initialSaint }: { initialSaint: DailySaint | null }) {
  const [saint, setSaint] = useState(initialSaint);

  useEffect(() => {
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      const date = localDateKey();
      try {
        const response = await fetch(`/api/saint-of-day?date=${date}`, { signal: controller.signal });
        if (response.ok && !stopped) {
          const data = await response.json();
          if (!stopped && localDateKey() === date) setSaint(data.saint);
        }
      } catch { /* Keep the last available card if the visitor goes offline. */ }
    };
    const schedule = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(() => { void refresh(); schedule(); }, midnight.getTime() - now.getTime() + 1000);
    };
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh(); schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => { stopped = true; controller?.abort(); clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);
  return <section className="home-daily-reading" aria-label="Saint of the day">
    <div><p>From the saint directory{saint ? ` · ${saint.feastDay}` : ""}</p><h2>{saint ? saintDisplayName(saint) : "A moment for reflection"}</h2><p className="daily-directory-note">A daily reading; the liturgical celebration may differ.</p></div>
    <Link href="/saint-of-day" className="btn-secondary">Read today’s reflection</Link>
  </section>;
}
