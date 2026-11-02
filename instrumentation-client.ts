import { initializePostHog } from "./lib/posthog-client";

try { initializePostHog(); } catch { /* Analytics must not prevent the app from starting. */ }
