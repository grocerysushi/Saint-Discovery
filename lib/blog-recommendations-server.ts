import "server-only";
import { unstable_cache } from "next/cache";
import { blogClient } from "./blog-server";
import type { RecommendationPost } from "./blog-recommendations";

// Share a small catalog; avoid fetching full articles for every saint page.
export const getRecommendationCatalog = unstable_cache(async () => {
  const client = await blogClient(true);
  const { data, error } = await client.database.from("blog_published_posts")
    .select("publishedAt,slug:published->>slug,title:published->>title,excerpt:published->>excerpt,category:published->>category")
    .order("publishedAt", { ascending: false }).order("id").limit(200)
    .abortSignal(AbortSignal.timeout(5000));
  if (error) throw new Error("Recommendation catalog unavailable");
  return (data ?? []) as unknown as RecommendationPost[];
}, ["blog-recommendation-catalog-v1"], { revalidate: 60 });
