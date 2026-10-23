import BlogRecommendations from "./BlogRecommendations";
import catalog from "@/lib/data/blog-artwork-catalog.json";
import { recommendBlogPosts } from "@/lib/blog-recommendations";
import type { Saint } from "@/lib/types";

// Render useful public article links in HTML, while retaining client refresh and
// click/view measurement. A blog outage must not make a biography unavailable.
export default async function BiographyArticles({ saint, placement = "biography_blog" }: { saint: Saint; placement?: "biography_blog" | "shared_result_blog" }) {
  if (saint.kind === "unresolved" || saint.kind === "observance") return null;
  return <BlogRecommendations key={saint.slug} saintSlug={saint.slug} placement={placement} initialPosts={recommendBlogPosts(saint, catalog)} />;
}
