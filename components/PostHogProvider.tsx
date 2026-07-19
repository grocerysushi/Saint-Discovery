"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Send events through our own /ingest reverse-proxy route so ad-blockers
// and privacy filters don't strip them. The route is implemented at
// app/ingest/[[...slug]]/route.ts and forwards to the real PostHog host.
const POSTHOG_INGEST = "/ingest";

if (typeof window !== "undefined" && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_INGEST,
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com",
    // Keep tracking opt-in only; no session recording unless you flip this on.
    capture_exceptions: true,
    // De-dupe page-view noise: client-side router navigations in App Router
    // already fire $pageview via capture_pageview. Disable duplicate capture
    // so the same page isn't double-counted on first paint.
    capture_pageview: false,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });
}

export default function PostHogProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    if (!POSTHOG_KEY) {
      // Surfaced once per session so a missing env var is obvious in dev.
      console.warn(
        "[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled."
      );
    }
  }, []);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
