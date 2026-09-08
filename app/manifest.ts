import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#111b21",
    theme_color: "#111b21",
    icons: [
      {
        src: "/icons/saint-discovery-v2-256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/saint-discovery-v2-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
