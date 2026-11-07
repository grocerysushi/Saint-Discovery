# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **Saint Discovery Quiz** (API base `https://f6zwvi29.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## Saint content policy

- The public catalog is exactly the slugs where `isPublishedSaintSlug` returns true: `status === "source-reviewed"` **and** `kind === "saint"`. Blesseds, Orthodox saints, observances, unresolved identities and duplicates stay in source control but are never published.
- `applySaintReview` in `lib/saint-reviews.ts` is the only place seed data becomes public copy. It replaces the description with the first reviewed biography paragraph and deliberately blanks `tagline` and `known_for`, because the legacy seed generator produced those without source review. Do not restore them from `lib/data/saints.json`; add reviewed prose to a review or expansion file instead.
- Because the published catalog only contains `kind: "saint"`, the `unresolved` / `observance` / `orthodox-saint` branches in the biography components are defensive. They exist for archived reviews and are unreachable from published pages.
- `tests/catholic-catalog.test.mjs` enforces both invariants. If a policy change is intended, update that test in the same commit.

## Verification

- `npm run lint`, `npx tsc --noEmit`, `npm test` and `npm run build` run in CI on every push and pull request (`.github/workflows/ci.yml`).
- Node is pinned to `.nvmrc`; `package.json` requires `>=22.22.0` because `posthog-node` (via `@insforge/cli`) does.
- Browser checks (`test:design`, `test:theme`, `test:learning`) need a running server and are not part of CI.
