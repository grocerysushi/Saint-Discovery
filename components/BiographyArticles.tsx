import BlogRecommendations from "./BlogRecommendations";
import { getReadingCatalog } from "@/lib/blog-recommendations-server";
import { recommendBlogPosts } from "@/lib/blog-recommendations";
import type { Saint } from "@/lib/types";

// Render useful public article links in HTML, while retaining client refresh and
// click/view measurement. A blog outage must not make a biography unavailable.
export default async function BiographyArticles({ saint }: { saint: Saint }) {
  if (saint.kind === "unresolved" || saint.kind === "observance") return null;
  const catalog = await getReadingCatalog().catch(() => []);
  return <BlogRecommendations key={saint.slug} saintSlug={saint.slug} placement="biography_blog" initialPosts={recommendBlogPosts(saint, catalog)} />;
}
