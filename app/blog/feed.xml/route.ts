import { getPublishedBlogPage } from "@/lib/blog-public";
import { xmlEscape } from "@/lib/blog-seo";
import { absoluteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { posts } = await getPublishedBlogPage(1, "", "", 50);
    const items = posts.map(p => { const c = p.published; const url = xmlEscape(absoluteUrl(`/blog/${c.slug}`)); return `<item><title>${xmlEscape(c.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xmlEscape(c.excerpt)}</description><category>${xmlEscape(c.category)}</category><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate></item>`; }).join("");
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Saint Discovery Journal</title><link>${absoluteUrl("/blog")}</link><description>Catholic saints, prayer, and everyday faith.</description><language>en-us</language><atom:link href="${absoluteUrl("/blog/feed.xml")}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "no-cache" } });
  } catch { return new Response("Journal feed temporarily unavailable", { status: 503, headers: { "Retry-After": "300", "Cache-Control": "no-store" } }); }
}
