import { NextRequest, NextResponse } from "next/server";
import { getSaintBySlug } from "@/lib/saints";
import { recommendBlogPosts } from "@/lib/blog-recommendations";
import { getRecommendationCatalog } from "@/lib/blog-recommendations-server";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("saint") ?? "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return NextResponse.json({ posts: [] }, { status: 400 });
  try {
    const saint = await getSaintBySlug(slug);
    if (!saint || saint.kind === "unresolved" || saint.kind === "observance") return NextResponse.json({ posts: [] }, { status: 404 });
    const posts = recommendBlogPosts(saint, await getRecommendationCatalog());
    return NextResponse.json({ posts }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60" } });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
