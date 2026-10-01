import "server-only";
import { unstable_cache } from "next/cache";
import { blogClient, blogConfig } from "./blog-server";
import type { RecommendationPost } from "./blog-recommendations";

// Share a small catalog; avoid fetching full articles for every saint page.
async function fetchCatalog() {
  const client = await blogClient(true);
  const { data, error } = await client.database.from("blog_published_posts")
    .select("publishedAt,slug:published->>slug,title:published->>title,excerpt:published->>excerpt,category:published->>category")
    .order("publishedAt", { ascending: false }).order("id").limit(200)
    .abortSignal(AbortSignal.timeout(5000));
  if (error) throw new Error("Recommendation catalog unavailable");
  return (data ?? []) as unknown as RecommendationPost[];
}
export async function getRecommendationCatalog() {
  return unstable_cache(fetchCatalog, ["blog-recommendation-catalog-v1", blogConfig().baseUrl], { revalidate: 60 })();
}

// Server-rendered biographies need fresh reading links without reducing every
// static biography's regeneration interval to the API's one-minute cache.
export async function getReadingCatalog() {
  return unstable_cache(fetchCatalog, ["blog-reading-catalog-v1", blogConfig().baseUrl], { revalidate: 3600 })();
}
