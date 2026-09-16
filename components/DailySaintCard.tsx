"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DailySaint } from "@/lib/saint-of-day";
import { localDateKey } from "@/lib/calendar-date";

export default function DailySaintCard({ initialSaint }: { initialSaint: DailySaint | null }) {
  const [saint, setSaint] = useState(initialSaint);
  const [failedImage, setFailedImage] = useState<string | null>(null);
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
  const image = saint?.image;
  const showImage = image && failedImage !== image.src;
  return <figure className={`hero-art daily-saint-card${showImage ? "" : " daily-saint-no-art"}`}>
    {showImage && <Image key={image.src} src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 100vw, 520px" priority onError={() => setFailedImage(image.src)} />}
    {!showImage && <div className="daily-saint-placeholder" aria-hidden><span>✦</span></div>}
    <figcaption className="art-caption">
      <p className="eyebrow">{saint ? `Saint of the day · ${saint.feastDay}` : "Discover the saints"}</p>
      <h2>{saint ? saintDisplayName(saint) : "A companion for your journey"}</h2>
      <Link href="/saint-of-day">Read, reflect &amp; pray today <span aria-hidden>↗</span></Link>
      {showImage && (image.generated
        ? <p className="daily-art-credit">AI-generated illustration · Artistic interpretation</p>
        : <a href={image.source} target="_blank" rel="noopener noreferrer" className="daily-art-credit">Artwork: {image.credit} · {image.license}</a>)}
      {!showImage && saint && <p className="daily-art-credit">Artwork unavailable. Their story is ready to explore.</p>}
    </figcaption>
  </figure>;
}
