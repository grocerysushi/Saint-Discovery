import "server-only";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export { sameOrigin } from "./request-origin";

export const BLOG_ADMIN_EMAIL = "hello@saintdiscoveryquiz.com";
export function blogConfig() {
  const baseUrl = process.env.INSFORGE_BLOG_URL;
  const anonKey = process.env.INSFORGE_BLOG_ANON_KEY;
  if (!baseUrl || !anonKey) throw new Error("Blog storage is not configured on this server.");
  return { baseUrl, anonKey };
}
export async function blogClient(publicOnly = false) {
  return createServerClient({ ...blogConfig(), cookies: publicOnly ? undefined : await cookies() });
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
