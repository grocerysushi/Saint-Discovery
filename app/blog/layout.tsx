import type { Metadata } from "next";
import "./blog.css";
export const metadata: Metadata = {
  title: "Catholic Saints, Prayer & Everyday Faith Blog",
  description: "Explore Catholic saints, prayer, and everyday faith in the Saint Discovery Journal.",
  alternates: { types: { "application/rss+xml": "/blog/feed.xml" } },
};
export default function BlogLayout({ children }: { children: React.ReactNode }) { return children; }
