import { BlogIndex } from "@/components/blog/BlogReader";
import "@/components/blog/reading-desk.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { getPublishedBlogPage, getPublishedBlogPost } from "@/lib/blog-public";
import { BLOG_STARTING_POINTS, type BlogStartingPoint } from "@/lib/blog-discovery";
import { blogBrowseUrl, blogCollectionSchema } from "@/lib/blog-seo";
import { absoluteUrl, serializeJsonLd, socialMetadata } from "@/lib/seo";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type BlogPage = Awaited<ReturnType<typeof getPublishedBlogPage>>;
async function browse(props: Props): Promise<BlogPage & { category: string; search: string; unavailable: boolean }> {
  const params = await props.searchParams;
  const raw = typeof params.page === "string" ? params.page : "1";
  if (!/^[1-9][0-9]*$/.test(raw) || Number(raw) > 100000) notFound();
  const category = typeof params.category === "string" && BLOG_CATEGORIES.includes(params.category) ? params.category : "";
  const search = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  let result: BlogPage;
  try {
    result = await getPublishedBlogPage(Number(raw), category, search);
  } catch {
    // A backend outage should not take out the blog landing page. Render the
    // archive shell with an honest notice instead of a 500.
    return { posts: [], total: 0, page: Number(raw), pages: 1, category, search, unavailable: true };
  }
  if (result.page > result.pages) notFound();
  return { ...result, category, search, unavailable: false };
}
export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await browse(props);
  const index = !data.unavailable && !data.category && !data.search && data.total > 0;
  const title = data.unavailable ? "Blog temporarily unavailable" : `Catholic Saints, Prayer & Everyday Faith Blog${data.page > 1 ? ` — Page ${data.page}` : ""}`;
  const description = data.unavailable ? "The Saint Discovery Blog is temporarily unavailable. Please try again shortly." : `${data.page > 1 ? `Page ${data.page}: ` : ""}Explore Catholic saints, prayer and everyday faith through source-linked articles and practical guides from the Saint Discovery Blog.`;
  const url = absoluteUrl(blogBrowseUrl(data.page, data.category, data.search));
  return { title, description, alternates: { canonical: url, types: { "application/rss+xml": "/blog/feed.xml" } }, robots: { index, follow: true, googleBot: { index, follow: true } },
    ...socialMetadata(title, description, url),
  };
}
export default async function Page(props: Props) {
  const data = await browse(props);
  const startingPoints: BlogStartingPoint[] = [];
  if (!data.unavailable && data.page === 1 && !data.category && !data.search) {
    const entries = await Promise.allSettled(BLOG_STARTING_POINTS.map(point => getPublishedBlogPost(point.slug)));
    entries.forEach((entry, index) => {
      if (entry.status !== "fulfilled" || !entry.value) return;
      const { title, slug, excerpt, author, category, cover, coverAlt, coverCredit } = entry.value.published;
      startingPoints.push({ id: BLOG_STARTING_POINTS[index].id, article: { title, slug, excerpt, author, category, cover, coverAlt, coverCredit } });
    });
  }
  return <>{!data.unavailable && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogCollectionSchema(data.posts, data.page, data.category, data.search)) }} />}<BlogIndex {...data} startingPoints={startingPoints} /></>;
}
