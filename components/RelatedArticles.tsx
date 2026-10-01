import Link from "next/link";
import { getReadingCatalog } from "@/lib/blog-recommendations-server";
import { relatedArticles } from "@/lib/blog-reading-paths";
import type { BlogContent } from "@/lib/blog";

export default async function RelatedArticles({ content }: { content: BlogContent }) {
  const catalog = await getReadingCatalog().catch(() => []);
  const posts = relatedArticles(content, catalog);
  if (!posts.length) return null;
  return <section className="blog-related-links" aria-labelledby="related-articles"><h2 id="related-articles">Read more on this topic</h2>{posts.map(post => <Link key={post.slug} href={`/blog/${post.slug}`}>{post.title} →</Link>)}</section>;
}
