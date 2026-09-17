import { bodyText, safeBlogUrl, type BlogContent } from "./blog";
import { absoluteUrl, siteConfig } from "./seo";

export function blogDescription(content: Pick<BlogContent, "excerpt"> & Partial<Pick<BlogContent, "body">>) {
  const text = (content.excerpt.trim() || (content.body ? bodyText(content.body) : "")).replace(/\s+/g, " ").trim();
  return text.length <= 160 ? text : `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}
export function blogImageUrl(cover: string) {
  const safe = safeBlogUrl(cover, true);
  return safe && !safe.startsWith("data:") ? absoluteUrl(safe) : undefined;
}
export function blogArticleSchema(content: BlogContent, publishedAt: string | null) {
  const url = absoluteUrl(`/blog/${content.slug}`);
  const image = blogImageUrl(content.cover);
  return {
    "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${url}#article`,
    headline: content.title, description: blogDescription(content), mainEntityOfPage: url, url,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(image ? { image: [image] } : {}),
    author: content.author === siteConfig.name
      ? { "@type": "Organization", name: content.author, url: absoluteUrl("/about") }
      : { "@type": "Person", name: content.author },
    publisher: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    articleSection: content.category, inLanguage: "en", isAccessibleForFree: true,
  };
}
export function blogBreadcrumbs(title: string, slug: string) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
    { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(`/blog/${slug}`) },
  ] };
}
export function xmlEscape(value: string) {
  return value.replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
}
export function blogBrowseUrl(page = 1, category = "", query = "") {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  return `/blog${params.size ? `?${params}` : ""}`;
}
