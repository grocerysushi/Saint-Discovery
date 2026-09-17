import { createAuthActions, createServerClient } from "@insforge/sdk/ssr";
import { NextRequest, NextResponse } from "next/server";
import { blogConfig } from "@/lib/blog-server";

export async function GET(request: NextRequest) {
  const origin = `${request.nextUrl.protocol}//${request.headers.get("host")}`;
  const failure = NextResponse.redirect(new URL("/admin/blog?signin=failed", origin));
  try {
    const code = request.nextUrl.searchParams.get("insforge_code");
    const verifier = request.cookies.get("blog_oauth_verifier")?.value;
    if (!code || !verifier) return failure;
    const response = NextResponse.redirect(new URL("/admin/blog", origin));
    const auth = createAuthActions({ ...blogConfig(), requestCookies: request.cookies, responseCookies: response.cookies });
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
