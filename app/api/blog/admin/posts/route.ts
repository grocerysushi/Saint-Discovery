import { blogResponse, requireBlogEditor, sameOrigin } from "@/lib/blog-server";
import { validateBlogPost } from "@/lib/blog-validation";
import { revalidatePath } from "next/cache";
export async function GET() {
  try {
    const client = await requireBlogEditor();
    if (!client) return blogResponse({ error: "Sign in with your blog editor account." }, 401);
    const { data, error } = await client.database.from("blog_editor_posts").select("id,revision,updatedAt,publishedAt,trashed,draft,published").order("updatedAt", { ascending: false }).limit(200);
    if (error) return blogResponse({ error: "Posts could not be loaded." }, 503);
    return blogResponse({ posts: data });
  } catch { return blogResponse({ error: "Blog storage is unavailable." }, 503); }
}
export async function PUT(request: Request) {
  if (!sameOrigin(request)) return blogResponse({ error: "Invalid request origin." }, 403);
  try {
    const client = await requireBlogEditor();
    if (!client) return blogResponse({ error: "Your session expired. Export your writing, then sign in again." }, 401);
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 6500000) return blogResponse({ error: "Post is too large. Use image URLs or smaller images." }, 413);
    let post;
    try { post = JSON.parse(text); } catch { return blogResponse({ error: "Invalid post data." }, 400); }
    const invalid = validateBlogPost(post);
    if (invalid) return blogResponse({ error: invalid }, 400);
    const { data, error } = await client.database.rpc("save_blog_post", { post });
    if (error) {
      const conflict = error.code === "40001";
      const duplicate = error.code === "23505";
      return blogResponse({ error: conflict ? "This post changed in another tab or device. Export your writing, then reload." : duplicate ? "That published URL is already in use, possibly by a trashed post. Choose another slug." : "The post could not be saved. Export your writing and try again." }, conflict || duplicate ? 409 : 503);
    }
    revalidatePath("/blog", "layout");
    revalidatePath("/blog/sitemap.xml");
    revalidatePath("/blog/feed.xml");
    return blogResponse({ post: data });
  } catch { return blogResponse({ error: "Blog storage is unavailable. Your latest changes have not been confirmed saved." }, 503); }
}
