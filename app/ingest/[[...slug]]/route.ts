import { NextRequest, NextResponse } from "next/server";

// Reverse proxy PostHog ingest requests through our own origin so ad-blockers
// and privacy filters don't strip them. The PostHog web SDK is configured
// (in components/PostHogProvider.tsx) to talk to "/ingest" on this app; that
// path is forwarded below to the real PostHog host.
//
// Docs: https://posthog.com/docs/advanced/proxy

const POSTHOG_HOST = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com"
).replace(/\/$/, "");

function buildTargetUrl(req: NextRequest): string {
  const incoming = new URL(req.url);
  // incoming.pathname is like "/ingest/<...slug>" or just "/ingest"
  const tail = incoming.pathname.replace(/^\/ingest\/?/, "");
  const target = `${POSTHOG_HOST}/${tail}`;
  const out = new URL(target);
  incoming.searchParams.forEach((v, k) => out.searchParams.set(k, v));
  return out.toString();
}

function forwardHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  // Preserve content-type so the body isn't mangled on the way through.
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  // Drop Next/Edge specific headers that confuse the upstream.
  const drop = new Set([
    "host",
    "connection",
    "content-length",
    "accept-encoding",
    "cookie",
  ]);
  req.headers.forEach((v, k) => {
    if (!drop.has(k.toLowerCase())) headers.set(k, v);
  });
  return headers;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const url = buildTargetUrl(req);
  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders(req),
    // POST/PUT may have a body; GET/HEAD must not.
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.text(),
    // Don't keep the upstream connection alive across requests.
    cache: "no-store",
  };

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (e) {
    return new NextResponse(`PostHog proxy error: ${(e as Error).message}`, {
      status: 502,
    });
  }

  // Pass through the upstream status + a small subset of headers. The SDK
  // cares about the body and the content-type; everything else is decoration.
  const respHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type");
  if (upstreamType) respHeaders.set("content-type", upstreamType);
  // Never proxy upstream cookies back to the user.
  respHeaders.set("cache-control", "no-store");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const OPTIONS = handle;
export const HEAD = handle;

// PostHog decides/features hit this path frequently; keep it dynamic so we
// never cache a stale decision.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
