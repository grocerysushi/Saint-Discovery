import { createAuthActions, refreshAuth } from "@insforge/sdk/ssr";
import { NextRequest } from "next/server";
import { BLOG_ADMIN_EMAIL, blogConfig, blogResponse, requireBlogEditor, sameOrigin } from "@/lib/blog-server";
export async function GET() {
  try { return blogResponse({ authenticated: !!(await requireBlogEditor()) }); }
  catch { return blogResponse({ error: "Blog sign-in is not configured on this server." }, 503); }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return blogResponse({ error: "Invalid request origin." }, 403);
  try {
    const input = await request.json();
    if (input.action === "refresh") {
      const result = await refreshAuth({ ...blogConfig(), request });
      return result.response;
    }
    const response = blogResponse({ ok: true });
    const auth = createAuthActions({ ...blogConfig(), requestCookies: request.cookies, responseCookies: response.cookies });
    if (input.action === "google") {
      const origin = request.headers.get("origin")!;
      const { data, error } = await auth.signInWithOAuth("google", {
        redirectTo: `${origin}/api/blog/auth/callback`, skipBrowserRedirect: true,
        additionalParams: { prompt: "select_account", login_hint: BLOG_ADMIN_EMAIL },
      });
      if (error || !data?.url || !data.codeVerifier) return blogResponse({ error: "Google sign-in could not be started. Please try again." }, 503);
      const redirectResponse = blogResponse({ url: data.url });
      redirectResponse.cookies.set("blog_oauth_verifier", data.codeVerifier, { httpOnly: true, secure: origin.startsWith("https:"), sameSite: "lax", path: "/api/blog/auth/callback", maxAge: 600 });
      return redirectResponse;
    }
    if (input.action === "signout") {
      await auth.signOut();
      return response;
    }
    return blogResponse({ error: "Invalid sign-in request." }, 400);
  } catch { return blogResponse({ error: "Sign-in is unavailable. Please try again." }, 503); }
}
