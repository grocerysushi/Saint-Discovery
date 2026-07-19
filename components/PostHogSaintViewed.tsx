"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

interface Props {
  slug: string;
  name: string;
  feastDay?: string | null;
  patronOf?: string | null;
}

// Fires a single saint_viewed event when the page mounts. Mounted from the
// server-rendered saint page so we get one event per detail-page view,
// regardless of whether the user scrolls or interacts.
export default function PostHogSaintViewed({
  slug,
  name,
  feastDay,
  patronOf,
}: Props) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog) return;
    posthog.capture("saint_viewed", {
      saint_slug: slug,
      saint_name: name,
      feast_day: feastDay ?? undefined,
      patron_of: patronOf ?? undefined,
    });
  }, [posthog, slug, name, feastDay, patronOf]);

  return null;
}
