import { BlogIndex } from "@/components/blog/BlogReader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { getPublishedBlogPage } from "@/lib/blog-public";
import { blogBrowseUrl } from "@/lib/blog-seo";
import { absoluteUrl } from "@/lib/seo";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
async function browse(props: Props) {
  const params = await props.searchParams;
  const raw = typeof params.page === "string" ? params.page : "1";
  if (!/^[1-9][0-9]*$/.test(raw) || Number(raw) > 100000) notFound();
  const category = typeof params.category === "string" && BLOG_CATEGORIES.includes(params.category) ? params.category : "";
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const result = await getPublishedBlogPage(Number(raw), category, search);
  if (result.page > result.pages) notFound();
  return { ...result, category, search };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await browse(props);
  const index = !data.category && !data.search && data.total > 0;
  const title = `Catholic Saints, Prayer & Everyday Faith Blog${data.page > 1 ? ` — Page ${data.page}` : ""}`;
  const url = absoluteUrl(blogBrowseUrl(data.page, data.category, data.search));
  return { title, alternates: { canonical: url, types: { "application/rss+xml": "/blog/feed.xml" } }, robots: { index, follow: true, googleBot: { index, follow: true } },
    openGraph: { title, description: "Stories about Catholic saints, prayer, and living your faith.", url, type: "website" },
    twitter: { card: "summary", title, description: "Stories about Catholic saints, prayer, and living your faith." },
  };
}
export default async function Page(props: Props) { return <BlogIndex {...await browse(props)} />; }
