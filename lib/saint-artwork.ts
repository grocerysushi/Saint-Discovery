import historicalImages from "@/lib/data/saint-images.json";
import imageOverrides from "@/lib/data/saint-image-overrides.json";
import addedImages from "@/lib/data/saint-artwork-additions.json";
import generatedImages from "@/lib/data/saint-generated-images.json";
import stableAssets from "@/lib/data/saint-artwork-assets.json";
import localAssets from "@/lib/data/saint-artwork-local.json";
import { canonicalSaintSlug } from "@/lib/saint-reviews";

export interface SaintArtwork {
  src: string; alt: string; credit: string; license: string; source: string;
  licenseUrl?: string; generated?: boolean; symbolic?: boolean;
}
const historical = { ...historicalImages, ...imageOverrides, ...addedImages } as Record<string, SaintArtwork>;
const generated = generatedImages as Record<string, SaintArtwork>;

export function symbolicSaintArtwork(name: string): SaintArtwork {
  return {
    src: "/images/saint-symbolic.svg",
    alt: `Symbolic cross and light for ${name}; this is not a portrait`,
    credit: "Saint Discovery", license: "Original symbolic artwork",
    source: "/editorial-policy", symbolic: true,
  };
}

export function getSaintArtwork(saint: { slug: string; name: string }): SaintArtwork {
  const slug = canonicalSaintSlug(saint.slug);
  const image = historical[slug] ?? generated[slug];
  // Commons tracking queries can produce 429s while the identical stable file
  // URL loads successfully. They are attribution-neutral and not asset keys.
  if (!image) return symbolicSaintArtwork(saint.name);
  const src = image.src.replace(/\?utm_source=.*$/, "");
  const optimized = (stableAssets as Record<string,string>)[src] ?? src;
  return { ...image, src: (localAssets as Record<string,string>)[optimized] ?? optimized };
}

export function saintArtworkPriority(slug: string): number {
  const canonical = canonicalSaintSlug(slug);
  return historical[canonical] ? 2 : generated[canonical] ? 1 : 0;
}
