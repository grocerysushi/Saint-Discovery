"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { analyticsAllowed } from "@/lib/visitor-privacy";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("pageshow", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("pageshow", onChange);
  };
}

function canLoadAdSense() {
  return ["saintdiscoveryquiz.com", "www.saintdiscoveryquiz.com"].includes(window.location.hostname)
    && analyticsAllowed();
}

const serverSnapshot = () => false;
const publicPath = /^(?:\/$|\/(?:about|blog|confirmation-saint-guide|editorial-policy|patron-saint-of|quiz|resources|saint-of-day|saints)(?:\/|$))/;

export default function AdSenseScript() {
  const pathname = usePathname();
  const allowed = useSyncExternalStore(subscribe, canLoadAdSense, serverSnapshot);
  if (!allowed || !publicPath.test(pathname)) return null;

  return <Script
    id="google-adsense"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6122544703023536"
    strategy="afterInteractive"
    crossOrigin="anonymous"
    async
  />;
}
