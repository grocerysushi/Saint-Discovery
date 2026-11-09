import "server-only";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export { sameOrigin } from "./request-origin";

export function blogConfig() {
  const baseUrl = process.env.INSFORGE_BLOG_URL;
  const anonKey = process.env.INSFORGE_BLOG_ANON_KEY;
  if (!baseUrl || !anonKey) throw new Error("Blog storage is not configured on this server.");
  return { baseUrl, anonKey };
}
// The access token is only ever read server-side, so keep it out of reach of
// scripts: an XSS on the admin origin must not be able to lift a session token.
export const AUTH_COOKIE_SETTINGS = { options: { accessToken: { httpOnly: true } } };
export async function blogClient(publicOnly = false) {
  return createServerClient({ ...blogConfig(), ...AUTH_COOKIE_SETTINGS, cookies: publicOnly ? undefined : await cookies() });
}
export async function requireBlogEditor() {
  const client = await blogClient();
  const { data, error } = await client.database.rpc("is_blog_editor");
  if (error || data !== true) return null;
  return client;
}
export function blogResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
