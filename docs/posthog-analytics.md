# PostHog public-site analytics

Production uses `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (the public project token, never a personal API key) and `NEXT_PUBLIC_POSTHOG_HOST`. Both are configured in Vercel Production. Changes require a new build. Missing configuration leaves the site usable.

GA4 remains enabled. PostHog receives page views, explicit events from `lib/analytics.ts` including quiz starts/completions, and a generic error when the global rendering fallback appears. Event arrival in the dashboard must be verified after deployment; a successful build does not prove ingestion.

The browser gate honors the existing analytics refusal, classroom mode, GPC/DNT, production-host restriction and admin exclusion. No initial consent popup is added. The footer privacy control disables both providers. Tests cover the gate, cross-tab withdrawal and URL sanitization.

Session replay, autocapture, automatic exception collection, feature flags, surveys and person profiles are disabled. PostHog uses memory persistence: a full reload creates a new identifier, so unique visitor and multi-page session counts should not be interpreted as deduplicated people. Same-page quiz events retain the identifier. Non-campaign query parameters and fragments are removed from URL properties before sending; raw exception messages are not collected. Internal/developer traffic carries a `traffic_type` property.

The wizard's editor identification, server logs and Python AI prompt/completion capture are not part of this release. The generated deferred files were preserved locally for separate review. No warehouse connector was created.

Validation: `npm test`, TypeScript, targeted ESLint, and a production build. Verify a real public-page event and quiz completion in PostHog after deployment; mark deliberate verification traffic as internal/developer and do not treat it as audience activity.
