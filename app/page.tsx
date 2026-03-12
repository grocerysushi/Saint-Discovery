import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Which Catholic Saint Are You?",
  description:
    "Discover which Catholic saint matches your spiritual gifts with a faith-based personality quiz rooted in Catholic tradition.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Which Catholic Saint Are You? Quiz",
    description:
      "Take the Catholic saint quiz, learn which saint you most resemble, and explore the meaning behind your result.",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Saint Discovery Catholic saint quiz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Which Catholic Saint Are You? Quiz",
    description:
      "Take the Catholic saint quiz and discover the saint who reflects your spiritual gifts.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default function Home() {
  return <HomePage />;
}
