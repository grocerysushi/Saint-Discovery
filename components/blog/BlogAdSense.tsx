"use client";

import Script from "next/script";
import { BLOG_ADS_BOOTSTRAP } from "@/lib/blog-ads";

export default function BlogAdSense() {
  if (process.env.NODE_ENV !== "production") return null;
  return <Script id="blog-adsense-bootstrap" strategy="afterInteractive">{BLOG_ADS_BOOTSTRAP}</Script>;
}
