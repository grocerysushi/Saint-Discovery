import "server-only";
import { cache } from "react";
import { blogClient } from "./blog-server";
import type { BlogContent } from "./blog";

export type BlogSummary = { id: string; publishedAt: string; published: Omit<BlogContent, "body" | "ads"> };
type SummaryRow = BlogSummary["published"] & { id: string; publishedAt: string };
const summaryColumns = 'id,publishedAt,title:published->>title,slug:published->>slug,excerpt:published->>excerpt,author:published->>author,category:published->>category,cover:published->>cover,coverAlt:published->>coverAlt,coverCredit:published->>coverCredit';

export const getPublishedBlogPage = cache(async (page = 1, category = "", search = "", size = 12) => {
  const client = await blogClient(true);
  let query = client.database.from("blog_published_posts").select(summaryColumns, { count: "exact" }).order("publishedAt", { ascending: false }).order("id");
  if (category) query = query.eq("published->>category", category);
  if (search) {
    // Quote the filter value and escape PostgREST and LIKE metacharacters.
    const value = `%${search.replace(/[\\%_]/g, '\\$&').replace(/"/g, '\\"')}%`;
    query = query.or(`published->>title.ilike."${value}",published->>excerpt.ilike."${value}"`);
  }
  const { data, count, error } = await query.range((page - 1) * size, page * size - 1);
  if (error) throw new Error("Published blog posts could not be loaded.");
  const posts = (data as unknown as SummaryRow[] ?? []).map(({ id, publishedAt, ...published }) => ({ id, publishedAt, published }));
  return { posts, total: count ?? posts.length, page, pages: Math.max(1, Math.ceil((count ?? posts.length) / size)) };
});

export const getPublishedBlogPost = cache(async (slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return null;
  const client = await blogClient(true);
  const { data, error } = await client.database.from("blog_published_posts").select("id,publishedAt,published").eq("published->>slug", slug).limit(1).maybeSingle();
  if (error) throw new Error("This story could not be loaded.");
  return data as { id: string; publishedAt: string; published: BlogContent } | null;
});

export async function getBlogSitemapEntries() {
  const client = await blogClient(true);
  const entries: { slug: string }[] = [];
  for (let offset = 0; offset < 50000; offset += 500) {
    const { data, error } = await client.database.from("blog_published_posts").select("slug:published->>slug").order("id").range(offset, offset + 499);
    if (error) throw new Error("The blog sitemap is temporarily unavailable.");
    entries.push(...(data as unknown as { slug: string }[]));
    if (data.length < 500) return entries;
  }
  throw new Error("The blog sitemap needs to be partitioned before exceeding 50,000 entries.");
}
