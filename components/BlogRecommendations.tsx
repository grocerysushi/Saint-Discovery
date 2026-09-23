"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import type { BlogRecommendation } from "@/lib/blog-recommendations";

type Placement = "result_blog" | "biography_blog";
function ArticleCard({ post, placement, saintSlug, position }: { post: BlogRecommendation; placement: Placement; saintSlug: string; position: number }) {
  const element = useRef<HTMLAnchorElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!element.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (!seen.current && entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .5)) {
        seen.current = true;
        track("article_recommendation_view", { article_slug: post.slug, saint_slug: saintSlug, link_placement: placement, recommendation_position: position, recommendation_version: "v1" });
        observer.disconnect();
      }
    }, { threshold: .5 });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [post.slug, saintSlug, placement, position]);
  return <Link ref={element} href={`/blog/${post.slug}`} className="blog-discovery-card" onClick={() => track("article_recommendation_click", { article_slug: post.slug, saint_slug: saintSlug, link_placement: placement, recommendation_position: position, recommendation_version: "v1" })}>
    <span className="blog-discovery-category">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p>
    <span className="blog-discovery-reason">{post.reason}</span><span className="text-link">Read the article <span aria-hidden>↗</span></span>
  </Link>;
}

// Keyed by saint at call sites so a different result cannot reuse old articles.
export default function BlogRecommendations({ saintSlug, placement }: { saintSlug: string; placement: Placement }) {
  const [posts, setPosts] = useState<BlogRecommendation[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    let active = true;
    fetch(`/api/blog/recommendations?saint=${encodeURIComponent(saintSlug)}`, { signal: controller.signal })
      .then(async response => response.ok ? response.json() : null)
      .then(data => { if (active && Array.isArray(data?.posts)) setPosts(data.posts); })
      .catch(() => { /* Optional reading must not interrupt the saint journey. */ })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; controller.abort(); window.clearTimeout(timeout); };
  }, [saintSlug]);
  const headingId = `blog-discovery-${placement}`;
  return <section className="blog-discovery" aria-labelledby={headingId}>
    <div className="blog-discovery-heading"><div><p className="eyebrow">From the Saint Discovery blog</p><h2 id={headingId}>Keep exploring your faith</h2></div>
      <Link href="/blog" className="text-link" onClick={() => track("blog_discovery_click", { saint_slug: saintSlug, link_placement: placement, recommendation_version: "v1" })}>Browse all articles <span aria-hidden>→</span></Link>
    </div>
    <p className="blog-discovery-intro">Practical guides to prayer, the saints, and living the Catholic faith.</p>
    {posts.length > 0 && <div className="blog-discovery-grid">{posts.map((post, index) => <ArticleCard key={`${saintSlug}:${post.slug}`} post={post} saintSlug={saintSlug} placement={placement} position={index + 1} />)}</div>}
  </section>;
}
