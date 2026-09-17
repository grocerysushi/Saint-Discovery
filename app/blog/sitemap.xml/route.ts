import { getBlogSitemapEntries } from "@/lib/blog-public";
import { xmlEscape } from "@/lib/blog-seo";
import { absoluteUrl } from "@/lib/seo";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const entries = await getBlogSitemapEntries();
    const urls = entries.length ? [absoluteUrl("/blog"), ...entries.map(p => absoluteUrl(`/blog/${p.slug}`))] : [];
    const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${xmlEscape(url)}</loc></url>`).join("")}</urlset>`;
    return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-cache" } });
  } catch { return new Response("Blog sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "300", "Cache-Control": "no-store" } }); }
}
