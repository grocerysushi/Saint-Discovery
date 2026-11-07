import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_SETTINGS, blogConfig } from "@/lib/blog-server";
import { siteConfig } from "@/lib/seo";

// Never build the post-login redirect from the Host header. It is attacker-
// controlled in principle, and a forged value would send a freshly authenticated
// editor to another site. Accept the canonical host, plus loopback in dev.
function callbackOrigin(request: NextRequest): string {
  const canonical = new URL(siteConfig.url);
  const host = request.headers.get("host") ?? "";
  if (host === canonical.host) return `${request.nextUrl.protocol}//${host}`;
  if (process.env.NODE_ENV !== "production" && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return `${request.nextUrl.protocol}//${host}`;
  }
  return canonical.origin;
}

export async function GET(request: NextRequest) {
  const origin = callbackOrigin(request);
  const failure = NextResponse.redirect(new URL("/admin/blog?signin=failed", origin));
  try {
    const code = request.nextUrl.searchParams.get("insforge_code");
    const verifier = request.cookies.get("blog_oauth_verifier")?.value;
    if (!code || !verifier) return failure;
    const response = NextResponse.redirect(new URL("/admin/blog", origin));
    const auth = createAuthActions({ ...blogConfig(), ...AUTH_COOKIE_SETTINGS, requestCookies: request.cookies, responseCookies: response.cookies });
    const { error } = await auth.exchangeOAuthCode(code, verifier);
    if (error) return failure;
    const client = createServerClient({ ...blogConfig(), cookies: response.cookies });
    const access = await client.database.rpc("is_blog_editor");
    if (access.error || access.data !== true) {
      failure.headers.set("location", new URL("/admin/blog?signin=denied", origin).toString());
      return failure;
    }
    response.cookies.set("blog_oauth_verifier", "", { httpOnly: true, path: "/api/blog/auth/callback", maxAge: 0 });
    return response;
  } catch { return failure; }
}
