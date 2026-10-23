import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/BlogReader";
import RelatedArticles from "@/components/RelatedArticles";
import { getPublishedBlogPost } from "@/lib/blog-public";
import { blogArticleSchema, blogBreadcrumbs, blogDescription, blogImageUrl } from "@/lib/blog-seo";
import { absoluteUrl, serializeJsonLd } from "@/lib/seo";
// The editor invalidates published pages on save. Direct backend updates
// refresh on the next request after an hour, without repeatedly rewriting stable articles.
export const revalidate = 3600;
export async function generateStaticParams() { return []; }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedBlogPost((await params).slug);
  if (!post) notFound();
  const content = post.published;
  const description = blogDescription(content);
  const image = blogImageUrl(content.cover);
  const url = absoluteUrl(`/blog/${content.slug}`);
  return { title: content.title, description, alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { type: "article", title: content.title, description, url, publishedTime: post.publishedAt, authors: [content.author], images: image ? [{ url: image, alt: content.coverAlt }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title: content.title, description, images: image ? [image] : [] },
  };
}
export default async function Page({ params }: Props) {
  const post = await getPublishedBlogPost((await params).slug);
  if (!post) notFound();
  const content = post.published;
  return <main className="blog-public site-width">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd([blogArticleSchema(content, post.publishedAt), blogBreadcrumbs(content.title, content.slug)]) }} />
    <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
      <ol role="list">
        <li><Link prefetch={false} href="/">Home</Link></li>
        <li>
          <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4" /></svg>
          <Link prefetch={false} href="/blog">Blog</Link>
        </li>
        <li className="blog-breadcrumb-current">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4" /></svg>
          <span aria-current="page">{content.title}</span>
        </li>
      </ol>
    </nav>
    <ArticleView content={content} date={post.publishedAt} />
    <RelatedArticles content={content} />
    <section className="blog-related-links" aria-labelledby="continue-exploring"><h2 id="continue-exploring">Continue exploring your faith</h2><Link prefetch={false} href="/resources">Read saint biographies →</Link><Link prefetch={false} href="/patron-saint-of">Explore patron-saint guides →</Link><Link prefetch={false} href="/confirmation-saint-guide">Choose a Confirmation saint →</Link><Link prefetch={false} href="/saint-of-day">Today’s saint and reflection →</Link></section>
  </main>;
}
