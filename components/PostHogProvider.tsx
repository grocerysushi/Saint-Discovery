"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// PostHog is initialized in instrumentation-client.ts (Next.js 15.3+ pattern).
// This component only provides the React context so child components can use
// the usePostHog() hook.
export default function PostHogProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
