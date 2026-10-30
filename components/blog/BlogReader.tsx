"use client";
import { Fragment, type ReactNode, useRef, useState } from "react";
import Link from "next/link";
import Image from "@/components/StaticImage";


import { articleLayout } from "@/lib/blog-layout";
import type { JSONContent } from "@tiptap/core";
import { BLOG_CATEGORIES, readingTime, safeBlogUrl, type BlogContent } from "@/lib/blog";
import type { BlogSummary } from "@/lib/blog-public";
import { blogBrowseUrl } from "@/lib/blog-seo";
import { BLOG_IMAGE_SIZES, BLOG_IMAGE_STYLE } from "@/lib/blog-images";
import { BLOG_STARTING_POINTS, type BlogStartingPoint } from "@/lib/blog-discovery";

export function BlogImage({ src, alt, className = "", priority = false, variant }: { src: string; alt: string; className?: string; priority?: boolean; variant?: keyof typeof BLOG_IMAGE_SIZES }) {
  const [failedSource, setFailedSource] = useState("");
  const safeSrc = safeBlogUrl(src, true);
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";
  if (!safeSrc || failedSource === src) return <div className={`blog-art-placeholder ${className}`} style={variant ? { position: "absolute", inset: 0, minHeight: 0 } : undefined} role={alt ? "img" : undefined} aria-hidden={alt ? undefined : true} aria-label={alt ? `Image unavailable: ${alt}` : undefined}><span aria-hidden>✦</span></div>;
  return <Image key={src} src={safeSrc} alt={alt} className={className} fill={!!variant} sizes={variant ? BLOG_IMAGE_SIZES[variant] : "100vw"} style={BLOG_IMAGE_STYLE} loading={loading} fetchPriority={fetchPriority} onError={() => setFailedSource(src)} />;
}
function renderNode(node: JSONContent, key: number, headingId?: string): ReactNode {
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
    case "heading": return node.attrs?.level === 3 ? <h3 id={headingId} key={key}>{children}</h3> : <h2 id={headingId} key={key}>{children}</h2>;
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "hardBreak": return <br key={key} />;
    case "horizontalRule": return <hr key={key} />;
    case "codeBlock": return <pre key={key}><code>{children}</code></pre>;
    case "image": return safeBlogUrl(node.attrs?.src, true) ? <figure key={key}><BlogImage src={node.attrs!.src} alt={node.attrs?.alt ?? ""} />{typeof node.attrs?.credit === 'string' && node.attrs.credit.trim() && <figcaption>{node.attrs.credit}</figcaption>}</figure> : null;
    default: return <Fragment key={key}>{children}</Fragment>;
  }
}
export function ArticleView({ content, date, preview = false }: { content: BlogContent; date?: string | null; preview?: boolean }) {
  const nodes = content.body.content ?? [];
  const { leadIndex } = articleLayout(nodes);
  const sections = nodes.flatMap((node, index) => node.type === "heading" && node.attrs?.level !== 3 ? [{ id: `article-section-${index}`, label: (node.content ?? []).map(n => n.text ?? "").join("") }] : []);
  return <div className="blog-article-wrap">

    <header className="blog-article-heading"><p className="eyebrow">{content.category} <span> / </span> The Saint Discovery Blog</p><h1>{content.title || "Your story starts here"}</h1><p className="blog-deck">{content.excerpt}</p><div className="blog-byline"><span className="blog-avatar" aria-hidden>✦</span><span>{content.author === "Saint Discovery" ? <Link prefetch={false} href="/about">Saint Discovery</Link> : content.author || "Author"}<small>{date ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "Draft preview"} · {readingTime(content.body)} min read</small></span></div></header>
    {leadIndex === 0 && <div className="blog-prose blog-lead">{renderNode(nodes[0], 0)}</div>}
    {content.cover && <figure className="blog-cover"><div className="blog-cover-frame"><BlogImage key={content.cover} src={content.cover} alt={content.coverAlt} variant="cover" priority /></div>{content.coverCredit && <figcaption>{content.coverCredit}</figcaption>}</figure>}
    <div className="blog-reading-grid"><article className="blog-prose">{sections.length >= 3 && <details className="blog-contents"><summary>In this article</summary><nav aria-label="In this article"><ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}</ol></nav></details>}{nodes.map((node, i) => i === leadIndex ? null : <Fragment key={i}>{renderNode(node, i, `article-section-${i}`)}</Fragment>)}<div className="blog-endmark" aria-hidden>✦</div></article><aside className="blog-reading-aside"><div className="blog-related-note"><p className="eyebrow">A life worth knowing</p><h2>Find a saint to walk with.</h2><p>Go deeper with the stories behind the names.</p><Link prefetch={false} href="/resources">Explore the saints →</Link></div></aside></div>
    {!preview && <aside className="blog-editorial-note" aria-label="About this publication"><p>Published by Saint Discovery, an independent Catholic learning project. Our research and writing use AI assistance; source links let you explore the references.</p><Link prefetch={false} href="/editorial-policy">Editorial approach &amp; corrections →</Link></aside>}
    {!preview && <div className="blog-back"><Link prefetch={false} href="/blog">← More from the blog</Link></div>}
  </div>;
}
function ReadingDesk({ points }: { points: BlogStartingPoint[] }) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const paths = points.flatMap(point => {
    const guide = BLOG_STARTING_POINTS.find(candidate => candidate.id === point.id);
    return guide ? [{ ...guide, article: point.article }] : [];
  });
  if (!paths.length) return null;
  return <section className="reading-desk" aria-labelledby="desk-heading">
    <div className="desk-invitation"><p className="desk-label">The Saint Discovery Blog</p><h1 id="desk-heading">What brings <br />you here?</h1><p>A good question is a place to begin. <br />Choose a starting point for your reading.</p>
      <div role="tablist" aria-label="Choose your reading starting point" className="desk-choices">{paths.map((path, index) => <button key={path.id} ref={element => { tabs.current[index] = element; }} id={`desk-tab-${path.id}`} type="button" role="tab" aria-controls={`desk-panel-${path.id}`} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
        const next = ["ArrowRight", "ArrowDown"].includes(event.key) ? (index + 1) % paths.length : ["ArrowLeft", "ArrowUp"].includes(event.key) ? (index + paths.length - 1) % paths.length : event.key === "Home" ? 0 : event.key === "End" ? paths.length - 1 : null;
        if (next !== null) { event.preventDefault(); setSelected(next); tabs.current[next]?.focus(); }
      }}><span className="desk-choice-full">{path.label}</span><span className="desk-choice-short">{path.shortLabel}</span><span aria-hidden>↗</span></button>)}</div>
      <a href="#story-archive" className="desk-archive-link">Or search all stories <span aria-hidden>↓</span></a>
    </div>
    {paths.map((path, index) => <section key={path.id} id={`desk-panel-${path.id}`} aria-labelledby={`desk-tab-${path.id}`} role="tabpanel" tabIndex={0} hidden={selected !== index} className="desk-recommendation">
      <div className="desk-book"><figure><div className="desk-art"><BlogImage src={path.article.cover} alt={path.article.coverAlt} variant="card" priority={index === 0} /></div>{path.article.coverCredit && <figcaption><details><summary>Artwork credit</summary><p>{path.article.coverCredit}</p></details></figcaption>}</figure>
        <div><p className="desk-start-label">Start here</p><h2><Link href={`/blog/${path.article.slug}`} prefetch={false}>{path.article.title}</Link></h2><p className="desk-excerpt">{path.article.excerpt}</p><Link prefetch={false} href={`/blog/${path.article.slug}`} className="desk-read">Read the guide <span aria-hidden>↗</span></Link></div>
      </div>
      <div className="desk-next"><p>{path.note}</p><Link prefetch={false} href={path.nextUrl}>{path.nextLabel} <span aria-hidden>→</span></Link></div>
    </section>)}
    <noscript><style>{`.reading-desk .desk-recommendation[hidden]{display:block!important}.reading-desk .desk-choices{display:none}`}</style></noscript>
  </section>;
}

export function BlogIndex({ posts, page, pages, total, category, search, startingPoints = [] }: { posts: BlogSummary[]; page: number; pages: number; total: number; category: string; search: string; startingPoints?: BlogStartingPoint[] }) {
  const [featured, ...rest] = posts;
  return <main className="blog-public blog-with-desk site-width">

    {startingPoints.length > 0 ? <ReadingDesk points={startingPoints} /> : <header className="desk-results-heading"><p>The Saint Discovery Blog</p><h1>{search ? `Stories about “${search}”` : category || "Explore the stories"}</h1><p>Source-linked guides to saints, prayer, and everyday Catholic life.</p></header>}
    <div className="desk-archive-heading" id="story-archive"><h2>{search || category ? `${total} ${total === 1 ? "story" : "stories"} found` : "The story archive"}</h2><Link prefetch={false} href="/blog/feed.xml">Subscribe via RSS ↗</Link></div>
    <div className="blog-browse"><nav aria-label="Story categories">{["All stories", ...BLOG_CATEGORIES].map(c => <Link prefetch={false} key={c} href={blogBrowseUrl(1, c === "All stories" ? "" : c, search)} aria-current={(category || "All stories") === c ? "page" : undefined}>{c}</Link>)}</nav><form action="/blog" role="search">{category && <input type="hidden" name="category" value={category} />}<input aria-label="Search stories" type="search" name="q" key={search} defaultValue={search} maxLength={100} placeholder="Search by topic or question" /><button type="submit">Search</button></form></div>
    {!featured ? <div className="blog-empty"><h2>{category || search ? "No stories match your search." : "New stories are on their way."}</h2><p>{category || search ? "Try another topic or browse all stories." : "Explore our saint biographies and guides while the first blog articles are being prepared."}</p><Link prefetch={false} href={category || search ? "/blog" : "/resources"} className="text-link">{category || search ? "Browse all stories →" : "Explore the saints →"}</Link></div> : <>
      <Link prefetch={false} href={`/blog/${featured.published.slug}`} className="blog-feature"><div className="blog-feature-art"><BlogImage src={featured.published.cover} alt={featured.published.coverAlt} variant="feature" priority /></div><div className="blog-feature-copy"><p className="eyebrow">{featured.published.category} · {page === 1 ? "Latest story" : `Page ${page}`}</p><h2>{featured.published.title}</h2><p>{featured.published.excerpt}</p><span className="blog-card-meta">{featured.published.author}</span><span className="blog-read-link">Read the story <span aria-hidden>↗</span></span></div></Link>

      {rest.length > 0 && <section className="blog-more"><div className="blog-section-title"><h2>A moment to explore</h2><span>{total} {total === 1 ? "story" : "stories"}</span></div><div className="blog-story-grid">{rest.map((post, i) => <Link prefetch={false} className={`blog-story-card blog-story-tone-${i % 2}`} key={post.id} href={`/blog/${post.published.slug}`}><div className="blog-card-art">{post.published.cover ? <BlogImage src={post.published.cover} alt={post.published.coverAlt} variant="card" /> : <><span aria-hidden>{i % 2 ? "☾" : "✦"}</span><small>The Saint Discovery Blog</small></>}</div><p className="eyebrow">{post.published.category}</p><h3>{post.published.title}</h3><p>{post.published.excerpt}</p><span className="blog-card-meta">{post.published.author} <span aria-hidden>↗</span></span></Link>)}</div></section>}
      {pages > 1 && <nav className="blog-pagination" aria-label="Blog pages">{page > 1 && <Link prefetch={false} href={blogBrowseUrl(page - 1, category, search)} rel="prev">← Newer stories</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link prefetch={false} href={blogBrowseUrl(page + 1, category, search)} rel="next">Older stories →</Link>}</nav>}
    </>}
    <section className="blog-invitation"><p className="eyebrow">Keep discovering</p><h2>A story can be the start of something.</h2><p>Meet the saints whose lives might speak to yours.</p><Link prefetch={false} href="/quiz" className="btn-primary">Find your saint ↗</Link><p><Link prefetch={false} href="/editorial-policy">How we prepare our content and handle corrections →</Link></p></section>
  </main>;
}
