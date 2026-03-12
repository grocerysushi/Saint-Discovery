import type { Metadata } from "next";
import ResourcesPage from "@/components/ResourcesPage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Catholic Resources and Saints Directory",
  description:
    "Browse trusted Catholic resources, discover saints of the day, and search a growing directory of Catholic saints by name, feast day, and vocation.",
  keywords: [
    "catholic saints directory",
    "saint of the day catholic",
    "catholic resources",
    "saints by feast day",
    "catholic saint list",
    "search catholic saints",
    "saint biographies catholic",
  ],
  alternates: {
    canonical: "/resources",
  },
  openGraph: {
    title: "Catholic Resources and Saints Directory",
    description:
      "Explore Catholic resources, saint biographies, feast days, and a searchable saint directory.",
    url: absoluteUrl("/resources"),
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Saint Discovery resources and saints directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catholic Resources and Saints Directory",
    description:
      "Search saints, browse feast days, and deepen your faith with trusted Catholic resources.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default function Resources() {
  return <ResourcesPage />;
}
