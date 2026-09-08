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
        src: "/icon?v=20260908",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/apple-icon?v=20260908",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
