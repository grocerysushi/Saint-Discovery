"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DailySaint } from "@/lib/saint-of-day";
import { localDateKey, subscribeToLocalDate } from "@/lib/calendar-date";

export default function DailySaintCard({ initialSaint }: { initialSaint: DailySaint | null }) {
  const [saint, setSaint] = useState(initialSaint);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  useEffect(() => {
    let controller: AbortController | undefined;
    let stopped = false;
    const refresh = async () => {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      const date = localDateKey();
      try {
        const response = await fetch(`/api/saint-of-day?date=${date}`, { signal: requestController.signal });
        if (response.ok && !stopped) {
          const data = await response.json();
          if (!stopped && !requestController.signal.aborted && localDateKey() === date) setSaint(data.saint);
        }
      } catch { /* Keep the last available card if the visitor goes offline. */ }
    };
    void refresh();
    const unsubscribe = subscribeToLocalDate(() => { void refresh(); });
    return () => { stopped = true; controller?.abort(); unsubscribe(); };
  }, []);
  const image = saint?.image;
  const showImage = image && failedImage !== image.src;
  return <figure className="home-artwork home-daily-feature" aria-labelledby="home-daily-title">
    <Link href="/saint-of-day" className="home-daily-feature-image" aria-label={saint ? `Read today’s story and reflection: ${saintDisplayName(saint)}` : "Read today’s reflection"}>
      {showImage ? <Image key={image.src} src={image.src} alt={image.alt} fill sizes="(max-width: 760px) 90vw, 40vw" priority onError={() => setFailedImage(image.src)} /> : <div className="home-daily-feature-placeholder"><span aria-hidden>✦</span><span>{saint ? "A life to discover" : "Make space for reflection"}</span></div>}
    </Link>
    <figcaption>
      <p className="home-daily-feature-label"><span>Saint of the Day</span>{saint && <span>{saint.feastDay}</span>}</p>
      <h2 id="home-daily-title"><Link href={saint ? `/saints/${saint.slug}` : "/saint-of-day"}>{saint ? saintDisplayName(saint) : "A moment for reflection"}</Link></h2>
      {showImage && <p className="home-daily-feature-credit">{image.generated ? "AI-generated illustration · Artistic interpretation" : <a href={image.source} target="_blank" rel="noopener noreferrer">{image.credit} · {image.license}</a>}</p>}
      {!showImage && <p className="home-daily-feature-credit">{saint ? "Artwork unavailable. Discover the story behind the name." : "Our directory has no saint entry for this date. You can still pause for today’s reflection."}</p>}
      {saint && <p className="daily-directory-note">A daily reading; the liturgical celebration may differ.</p>}
      <Link href="/saint-of-day" className="text-link home-daily-feature-action">Read today’s reflection <span aria-hidden>→</span></Link>
    </figcaption>
  </figure>;
}
