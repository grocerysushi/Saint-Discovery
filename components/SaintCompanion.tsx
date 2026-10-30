"use client";
import { useState } from "react";
import Link from "next/link";
import { companionDays, companionDocument } from "@/lib/saint-companion";
import { track } from "@/lib/analytics";

export default function SaintCompanion({ name, slug }: { name: string; slug: string }) {
  const [day, setDay] = useState(0);
  const [status, setStatus] = useState("Download a reading card. No email or account needed.");
  const days = companionDays(name), selected = days[day];
  function download() {
    const url = URL.createObjectURL(new Blob([companionDocument(name, slug)], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `three-days-with-${slug.replace(/[^a-z0-9-]/g, "")}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Reading card downloaded. Open it to read or print all three days.");
  }
  return <section className="saint-companion" aria-label={`Three days with ${name}`}>
    <p className="companion-invitation">A life is more than a quiz result. Give this one a little room in yours.</p>
    <div className="companion-days" role="group" aria-label="Choose a day">{days.map((item, i) => <button key={item.label} type="button" onClick={() => setDay(i)} aria-pressed={day === i}><small>Day {i + 1}</small>{item.label}</button>)}</div>
    <div className="companion-day" aria-live="polite"><h2>{selected.title}</h2><p>{selected.copy}</p><p>{selected.prompt}</p>
      {day === 0 && <Link prefetch={false} href={`/saints/${slug}`} onClick={() => track("biography_click", { saint_slug: slug, link_placement: "result_primary" })} className="btn-primary result-primary-story">Read the full story <span aria-hidden>↗</span></Link>}
      <small>Original suggestions by Saint Discovery, not quotations or religious obligations.</small>
    </div>
    <div className="companion-keep"><button type="button" onClick={download} className="text-link">Keep the three-day reflection <span aria-hidden>↓</span></button><p role="status">{status}</p><small>Move through the days at your own pace. No reminders are scheduled.</small></div>
  </section>;
}
