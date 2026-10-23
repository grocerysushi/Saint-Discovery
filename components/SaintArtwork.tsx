"use client";

import { useState } from "react";
import Image from "@/components/StaticImage";
import type { SaintArtwork as Artwork } from "@/lib/saint-artwork";

export type ArtworkPreview = Pick<Artwork, "src" | "alt" | "symbolic" | "generated" | "unoptimized">;

export function SaintArtworkThumbnail({ artwork }: { artwork: ArtworkPreview }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const symbolic = artwork.symbolic || failedSource === artwork.src;
  // The enclosing directory link already contains the saint's name and summary.
  // Keep its thumbnail decorative; the biography provides the artwork description.
  return <span className="catalogue-artwork" data-symbolic={symbolic || undefined}>
    <Image src={symbolic ? "/images/saint-symbolic.svg" : artwork.src}
      alt=""
      width={320} height={240} sizes="(max-width: 760px) 90vw, 240px" loading="lazy"
      onError={() => setFailedSource(artwork.src)} />
    {(symbolic || artwork.generated) && <span>{symbolic ? "Symbolic artwork" : "AI illustration"}</span>}
  </span>;
}

export default function SaintArtworkFigure({ artwork, name }: { artwork: Artwork; name: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const symbolic = artwork.symbolic || failedSource === artwork.src;
  return <figure className="biography-artwork" data-symbolic={symbolic || undefined}>
    <Image src={symbolic ? "/images/saint-symbolic.svg" : artwork.src}
      alt={symbolic ? `Symbolic cross and light for ${name}; not a portrait` : artwork.alt}
      width={960} height={720} sizes="(max-width: 760px) 90vw, 640px"
      onError={() => setFailedSource(artwork.src)} />
    <figcaption>{symbolic ? <><strong>Symbolic artwork · Not a portrait.</strong> Original cross and light illustration by Saint Discovery. A verified reusable likeness has not been assigned{failedSource ? " or could not be loaded" : ""}.</>
      : artwork.generated ? <>AI-generated illustration · Artistic interpretation by Saint Discovery.</>
      : <><a href={artwork.source} target="_blank" rel="noopener noreferrer">{artwork.credit} · Source ↗</a> · {artwork.licenseUrl ? <a href={artwork.licenseUrl} target="_blank" rel="noopener noreferrer">{artwork.license} ↗</a> : artwork.license}{artwork.src.startsWith("/images/saint-artwork/") && <span> · Resized for the web; no cropping or retouching.</span>}</>}
    </figcaption>
  </figure>;
}
