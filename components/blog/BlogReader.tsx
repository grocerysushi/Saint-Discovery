"use client";
/* eslint-disable @next/next/no-img-element -- Prototype supports local image uploads and arbitrary HTTPS cover URLs. */
import { Fragment, type ReactNode, useState } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { BLOG_CATEGORIES, readingTime, safeBlogUrl, type BlogContent } from "@/lib/blog";
import type { BlogSummary } from "@/lib/blog-public";
import { blogBrowseUrl } from "@/lib/blog-seo";

// Placeholders stay hidden until a live ad network is approved; flip to true to preview placements.
const SHOW_AD_PLACEHOLDERS = false;
export function AdSpace({ format = "banner" }: { format?: "banner" | "rectangle" | "inline" }) {
  if (!SHOW_AD_PLACEHOLDERS) return null;
  return <aside className={`blog-ad blog-ad-${format}`} aria-label="Advertisement placeholder"><span>Advertisement</span><div><span aria-hidden>▧</span><p>Space for a thoughtful partner</p><small>{format === "banner" ? "Responsive banner · 728 × 90 desktop" : format === "rectangle" ? "Sidebar · 300 × 250" : "In-article · responsive"}</small></div><span>Preview placement · no live ads</span></aside>;
}
export function BlogImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [broken, setBroken] = useState(false);
  return !broken && safeBlogUrl(src, true) ? <img src={safeBlogUrl(src, true)} alt={alt} className={className} onError={() => setBroken(true)} /> : <div className={`blog-art-placeholder ${className}`} role="img" aria-label={alt || "Saint Discovery journal"}><span aria-hidden>✦</span></div>;
}
function renderNode(node: JSONContent, key: number): ReactNode {
  const children = node.content?.map((n, i) => renderNode(n, i));
  if (node.type === "text") {
    let value: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") value = <strong>{value}</strong>;
      if (mark.type === "italic") value = <em>{value}</em>;
      if (mark.type === "strike") value = <s>{value}</s>;
      if (mark.type === "underline") value = <u>{value}</u>;
      if (mark.type === "code") value = <code>{value}</code>;
      if (mark.type === "link" && safeBlogUrl(mark.attrs?.href)) value = <a href={safeBlogUrl(mark.attrs?.href)} rel="noopener noreferrer">{value}</a>;
    }
    return <Fragment key={key}>{value}</Fragment>;
  }
  switch (node.type) {
    case "paragraph": return <p key={key}>{children || <br />}</p>;
    case "heading": return node.attrs?.level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "hardBreak": return <br key={key} />;
    case "horizontalRule": return <hr key={key} />;
    case "codeBlock": return <pre key={key}><code>{children}</code></pre>;
    case "image": return safeBlogUrl(node.attrs?.src, true) ? <figure key={key}><BlogImage src={node.attrs!.src} alt={node.attrs?.alt ?? ""} /></figure> : null;
    default: return <Fragment key={key}>{children}</Fragment>;
  }
}
export function ArticleView({ content, date, preview = false }: { content: BlogContent; date?: string | null; preview?: boolean }) {
  const nodes = content.body.content ?? [];
  return <div className="blog-article-wrap">
    <header className="blog-article-heading"><p className="eyebrow">{content.category} <span> / </span> The Saint Discovery Journal</p><h1>{content.title || "Your story starts here"}</h1><p className="blog-deck">{content.excerpt}</p><div className="blog-byline"><span className="blog-avatar" aria-hidden>✦</span><span>{content.author || "Author"}<small>{date ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "Draft preview"} · {readingTime(content.body)} min read</small></span></div></header>
    {content.cover && <figure className="blog-cover"><BlogImage key={content.cover} src={content.cover} alt={content.coverAlt} />{content.coverCredit && <figcaption>{content.coverCredit}</figcaption>}</figure>}
    <div className={`blog-reading-grid ${!content.ads ? "blog-no-ads" : ""}`}><article className="blog-prose">{nodes.map((node, i) => <Fragment key={i}>{renderNode(node, i)}{content.ads && i === 3 && nodes.length > 5 && <AdSpace format="inline" />}</Fragment>)}<div className="blog-endmark" aria-hidden>✦</div></article>{content.ads && <aside className="blog-reading-aside"><AdSpace format="rectangle" /><div className="blog-related-note"><p className="eyebrow">A life worth knowing</p><h2>Find a saint to walk with.</h2><p>Go deeper with the stories behind the names.</p><Link href="/resources">Explore the saints →</Link></div></aside>}</div>
    {!preview && <div className="blog-back"><Link href="/blog">← More from the journal</Link></div>}
  </div>;
}
export function BlogIndex({ posts, page, pages, total, category, search }: { posts: BlogSummary[]; page: number; pages: number; total: number; category: string; search: string }) {
  const [featured, ...rest] = posts;
  return <main className="blog-public site-width"><div className="blog-demo-note"><span>The Saint Discovery Journal</span><Link href="/blog/feed.xml">Subscribe via RSS ↗</Link></div>
    <header className="blog-masthead"><p className="eyebrow">The Saint Discovery Journal</p><h1>Old wisdom.<br /><em>Everyday life.</em></h1><p>Stories, reflections, and small invitations to live your faith.<br className="blog-desktop-break" /> A little inspiration for the journey.</p></header>
    <div className="blog-browse"><nav aria-label="Story categories">{["All stories", ...BLOG_CATEGORIES].map(c => <Link key={c} href={blogBrowseUrl(1, c === "All stories" ? "" : c, search)} aria-current={(category || "All stories") === c ? "page" : undefined}>{c}</Link>)}</nav><form action="/blog" role="search">{category && <input type="hidden" name="category" value={category} />}<input aria-label="Search stories" type="search" name="q" key={search} defaultValue={search} maxLength={100} placeholder="Search the journal…" /><button type="submit">Search</button></form></div>
    {!featured ? <div className="blog-empty"><h2>{category || search ? "No stories match your search." : "New stories are on their way."}</h2><p>{category || search ? "Try another topic or browse all stories." : "Explore our saint biographies and guides while the first journal articles are being prepared."}</p><Link href={category || search ? "/blog" : "/resources"} className="text-link">{category || search ? "Browse all stories →" : "Explore the saints →"}</Link></div> : <>
      <Link href={`/blog/${featured.published.slug}`} className="blog-feature"><BlogImage src={featured.published.cover} alt={featured.published.coverAlt} /><div><p className="eyebrow">{featured.published.category} · {page === 1 ? "Latest story" : `Page ${page}`}</p><h2>{featured.published.title}</h2><p>{featured.published.excerpt}</p><span className="blog-card-meta">{featured.published.author}</span><span className="blog-read-link">Read the story <span aria-hidden>↗</span></span></div></Link>
      <AdSpace />
      {rest.length > 0 && <section className="blog-more"><div className="blog-section-title"><h2>A moment to explore</h2><span>{total} {total === 1 ? "story" : "stories"}</span></div><div className="blog-story-grid">{rest.map((post, i) => <Link className={`blog-story-card blog-story-tone-${i % 2}`} key={post.id} href={`/blog/${post.published.slug}`}><div className="blog-card-art">{post.published.cover ? <BlogImage src={post.published.cover} alt={post.published.coverAlt} /> : <><span aria-hidden>{i % 2 ? "☾" : "✦"}</span><small>The Saint Discovery Journal</small></>}</div><p className="eyebrow">{post.published.category}</p><h3>{post.published.title}</h3><p>{post.published.excerpt}</p><span className="blog-card-meta">{post.published.author} <span aria-hidden>↗</span></span></Link>)}</div></section>}
      {pages > 1 && <nav className="blog-pagination" aria-label="Journal pages">{page > 1 && <Link href={blogBrowseUrl(page - 1, category, search)} rel="prev">← Newer stories</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link href={blogBrowseUrl(page + 1, category, search)} rel="next">Older stories →</Link>}</nav>}
    </>}
    <section className="blog-invitation"><p className="eyebrow">Keep discovering</p><h2>A story can be the start of something.</h2><p>Meet the saints whose lives might speak to yours.</p><Link href="/quiz" className="btn-primary">Find your saint ↗</Link></section>
  </main>;
}
