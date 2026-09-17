import { blogClient, blogResponse } from "@/lib/blog-server";
export async function GET() {
  try {
    const client = await blogClient(true);
    const { data, error } = await client.database.from("blog_published_posts").select("id,revision,updatedAt,publishedAt,trashed,draft,published").order("publishedAt", { ascending: false }).limit(200);
    if (error) return blogResponse({ error: "The journal could not be loaded. Please try again." }, 503);
    return blogResponse({ posts: data });
  } catch { return blogResponse({ error: "Blog storage is not configured on this server." }, 503); }
}
