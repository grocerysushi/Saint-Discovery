"use client";

import { useEffect, useState } from "react";
import SaintArtworkFigure from "@/components/SaintArtwork";
import type { SaintArtwork } from "@/lib/saint-artwork";

export default function ResultArtwork({ slug, name }: { slug: string; name: string }) {
  const [artwork, setArtwork] = useState<SaintArtwork | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/saint-artwork/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!controller.signal.aborted) setArtwork(data); })
      .catch(() => { /* The result remains usable if artwork cannot load. */ });
    return () => controller.abort();
  }, [slug]);
  return artwork ? <SaintArtworkFigure artwork={artwork} name={name} /> : null;
}
