import posthog from "posthog-js";
import { analyticsAllowed } from "./visitor-privacy";

let initialized = false;
let stopped = false;

export function posthogAllowed(): boolean {
  if (typeof window === "undefined" || stopped) return false;
  try {
    const url = new URL(window.location.href);
    return analyticsAllowed() &&
      window["ga-disable-G-C75CMC27YN"] !== true &&
      ["www.saintdiscoveryquiz.com", "saintdiscoveryquiz.com"].includes(url.hostname) &&
      !/^\/admin(?:\/|$)/i.test(decodeURIComponent(url.pathname));
  } catch { return false; }
}

// Retain campaign attribution without signed email links or arbitrary queries.
export function safeAnalyticsUrl(value: string): string {
  try {
    const url = new URL(value);
    for (const key of Array.from(url.searchParams.keys())) {
      if (!/^utm_(source|medium|campaign|content|term)$/.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.href;
  } catch { return ""; }
}

function sanitizeUrls(properties: Record<string, unknown>) {
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === "string" && /url|referrer/i.test(key)) properties[key] = safeAnalyticsUrl(value);
    else if (value && typeof value === "object" && !Array.isArray(value)) sanitizeUrls(value as Record<string, unknown>);
  }
}

export function initializePostHog(): boolean {
  if (initialized) return posthogAllowed();
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host || !posthogAllowed()) return false;
  posthog.init(token, {
    api_host: host,
    defaults: "2025-05-24",
    autocapture: false,
    capture_pageview: "history_change",
    capture_pageleave: false,
    capture_exceptions: false,
    capture_dead_clicks: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    person_profiles: "never",
    persistence: "memory",
    save_referrer: false,
    request_batching: false,
    before_send: event => {
      if (!event || !posthogAllowed()) return null;
      sanitizeUrls(event.properties);
      const mode = window.localStorage.getItem("sd:analytics-mode");
      if (mode === "internal" || mode === "developer") event.properties.traffic_type = mode;
      return event;
    },
  });
  initialized = true;
  const stop = () => {
    stopped = true;
    posthog.opt_out_capturing();
  };
  window.addEventListener("storage", event => {
    if (event.key === null || event.key === "sd:privacy:v1" || event.key === "sd:analytics-mode") stop();
  });
  window.addEventListener("sd:analytics-mode-changed", stop);
  for (const event of ["focus", "pageshow", "popstate", "visibilitychange"]) {
    window.addEventListener(event, () => { if (!posthogAllowed()) stop(); });
  }
  return true;
}

export function capturePostHog(event: string, properties?: Record<string, string | number | boolean | undefined>): boolean {
  try {
    if (!initializePostHog() || !posthogAllowed()) return false;
    return Boolean(posthog.capture(event, properties));
  } catch { return false; }
}

export function capturePublicError() {
  try {
    if (initializePostHog() && posthogAllowed()) {
      // Raw exception messages can contain signed URLs or user-entered content.
      posthog.captureException(new Error("Public page rendering failed"));
    }
  } catch { /* Telemetry must not break the error fallback. */ }
}
