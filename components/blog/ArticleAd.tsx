"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/blog-ads";
import { classroomMode } from "@/lib/visitor-privacy";

// Verified in the existing publisher account; category/advertiser blocking is
// still managed by that account. This unit is used once per eligible article.
export const ARTICLE_AD_SLOT = "9590084903";

export default function ArticleAd() {
  const slot = useRef<HTMLModElement>(null);
  useEffect(() => {
    if (classroomMode()) return;
    if (process.env.NODE_ENV !== "production" || !slot.current
      || location.protocol !== "https:"
      || !["www.saintdiscoveryquiz.com", "saintdiscoveryquiz.com"].includes(location.hostname)
      || !/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(location.pathname)
      || new URL(location.href).searchParams.has("preview")) return;
    const element = slot.current;
    let requested = false;
    const request = () => {
      if (requested || element.hasAttribute("data-adsbygoogle-status") || element.getBoundingClientRect().width === 0) return;
      requested = true;
      const adsWindow = window as Window & { adsbygoogle?: { push: (value: object) => unknown } };
      try { (adsWindow.adsbygoogle ??= [] as object[]).push({}); } catch { /* Ads must never interrupt reading. */ }
    };
    if (typeof IntersectionObserver === "undefined") { request(); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { request(); if (requested) observer.disconnect(); }
    }, { rootMargin: "600px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <aside className="blog-article-ad" aria-label="Advertisement">
    <p className="blog-ad-label">Advertisement</p>
    <ins ref={slot} className="adsbygoogle" style={{ display: "block", textAlign: "center" }}
      data-ad-layout="in-article" data-ad-format="fluid" data-ad-client={ADSENSE_CLIENT} data-ad-slot={ARTICLE_AD_SLOT} />
  </aside>;
}
