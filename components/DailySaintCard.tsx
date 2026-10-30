"use client";
import { useEffect, useState } from "react";
import Image from "@/components/StaticImage";
import Link from "next/link";
import { saintDisplayName } from "@/lib/saint-seo";
import type { DailySaint } from "@/lib/saint-of-day";
import { localDateKey, subscribeToLocalDate } from "@/lib/calendar-date";

export default function DailySaintCard({ initialSaint, compact = false }: { initialSaint: DailySaint | null; compact?: boolean }) {
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
  if (compact) return <section className="discovery-daily-strip" aria-label="Saint of the Day"><div><p>A story for today</p><small>{saint?.feastDay ?? "Saint of the Day"}</small></div><div><h2>{saint ? saintDisplayName(saint) : "A moment for reflection"}</h2><p>A daily reading; liturgical celebrations may differ by place.</p></div><Link prefetch={false} href="/saint-of-day" className="text-link">Meet today’s saint <span aria-hidden>↗</span></Link></section>;
  const image = saint?.image;
  // Use the complete, reviewed version of this painting for the home feature.
  const imageSrc = saint?.slug === "evaristus" && image && !image.symbolic ? "/images/evaristus-gallery.jpg" : image?.src;
  const symbolic = image?.symbolic || failedImage === image?.src;
  const showImage = !!image;
  return <figure className="home-artwork home-daily-feature" aria-labelledby="home-daily-title">
    <p className="home-daily-feature-label"><span>Saint of the Day</span>{saint && <span>{saint.feastDay}</span>}</p>
    <div className="gallery-saint-title"><h2 id="home-daily-title"><Link prefetch={false} href={saint ? `/saints/${saint.slug}` : "/saint-of-day"}>{saint ? saintDisplayName(saint) : "A moment for reflection"}</Link></h2><Link prefetch={false} href="/saint-of-day" className="text-link home-daily-feature-action">Today’s reflection <span aria-hidden>→</span></Link></div>
    <Link prefetch={false} href="/saint-of-day" className="home-daily-feature-image" aria-label={saint ? `Read today’s story and reflection: ${saintDisplayName(saint)}` : "Read today’s reflection"}>
      {image ? <Image key={symbolic ? "symbolic" : imageSrc} src={symbolic ? "/images/saint-symbolic.svg" : imageSrc!} alt={symbolic ? `Symbolic artwork for ${saint?.name}; not a portrait` : image.alt} fill sizes="(max-width: 760px) 90vw, 40vw" priority onError={() => setFailedImage(image.src)} /> : <div className="home-daily-feature-placeholder"><span aria-hidden>✦</span><span>{saint ? "A life to discover" : "Make space for reflection"}</span></div>}
    </Link>
    <figcaption>
      {image && <p className="home-daily-feature-credit">{symbolic ? "Symbolic artwork · Not a portrait" : image.generated ? "AI-generated illustration · Artistic interpretation" : <a href={image.source} target="_blank" rel="noopener noreferrer">{image.credit} · {image.license}</a>}</p>}
      {!showImage && <p className="home-daily-feature-credit">{saint ? "Artwork unavailable. Discover the story behind the name." : "Open today’s reflection to explore a life of faith."}</p>}
      {saint && <p className="daily-directory-note">A daily reading; the liturgical celebration may differ.</p>}
    </figcaption>
  </figure>;
}
