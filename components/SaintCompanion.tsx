"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { companionDays, companionDocument } from "@/lib/saint-companion";
import { track } from "@/lib/analytics";

export default function SaintCompanion({ name, slug }: { name: string; slug: string }) {
  const [day, setDay] = useState(0);
  const [saved, setSaved] = useState(false);
  const days = companionDays(name), selected = days[day];
  function download() {
    const url = URL.createObjectURL(new Blob([companionDocument(name, slug)], { type: "text/html;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `three-days-with-${slug.replace(/[^a-z0-9-]/g, "")}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
    // Also confirmed inline: toasts sit beneath the modal <dialog> this can appear in (DiscoverySample).
    toast.success("Reading card downloaded.", { description: "Open it to read or print all three days." });
  }
  return <section className="saint-companion" aria-label={`Three days with ${name}`}>
    <p className="companion-invitation">A life is more than a quiz result. Give this one a little room in yours.</p>
    <div className="companion-days" role="group" aria-label="Choose a day">{days.map((item, i) => <button key={item.label} type="button" onClick={() => setDay(i)} aria-pressed={day === i}><small>Day {i + 1}</small>{item.label}</button>)}</div>
    <div className="companion-day" aria-live="polite"><h2>{selected.title}</h2><p>{selected.copy}</p><p>{selected.prompt}</p>
      {day === 0 && (
        <Button asChild variant="gold" size="cta" className="result-primary-story">
          <Link
            prefetch={false}
            href={`/saints/${slug}`}
            onClick={() => track("biography_click", { saint_slug: slug, link_placement: "result_primary" })}
          >
            Read the full story <span aria-hidden>↗</span>
          </Link>
        </Button>
      )}
      <small>Original suggestions by Saint Discovery, not quotations or religious obligations.</small>
    </div>
    <div className="companion-keep"><button type="button" onClick={download} className="text-link">Keep the three-day reflection <span aria-hidden>↓</span></button><p role="status">{saved ? "Reading card downloaded. Open it to read or print all three days." : "Download a reading card. No email or account needed."}</p><small>Move through the days at your own pace. No reminders are scheduled.</small></div>
  </section>;
}
