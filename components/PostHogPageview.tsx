"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

// Fires a $pageview event on every route change. The PostHog SDK is
// configured with capture_pageview: false (see PostHogProvider) because the
// first page is captured automatically — we only need to handle the
// subsequent client-side navigations.
export default function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog || !pathname) return;
    let url = window.origin + pathname;
    if (searchParams?.toString()) {
      url += `?${searchParams.toString()}`;
    }
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}
