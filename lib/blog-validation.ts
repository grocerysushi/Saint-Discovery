import { publicationError, type BlogContent, type BlogPost } from "./blog";

function validContent(value: unknown): value is BlogContent {
  if (!value || typeof value !== "object") return false;
  const c = value as BlogContent;
  const limits = { title: 200, slug: 100, excerpt: 300, author: 100, category: 100, cover: 1100000, coverAlt: 1000, coverCredit: 1000 };
  for (const [key, limit] of Object.entries(limits)) {
    const field = c[key as keyof BlogContent];
    if (typeof field !== "string" || field.length > limit) return false;
  }
  if (typeof c.ads !== "boolean" || c.body?.type !== "doc" || !Array.isArray(c.body.content)) return false;
  let count = 0;
  function validNode(node: unknown, depth: number): boolean {
    if (!node || typeof node !== "object" || depth > 30 || ++count > 10000) return false;
    const n = node as { type?: unknown; text?: unknown; content?: unknown; marks?: unknown };
    if (typeof n.type !== "string" || (n.text !== undefined && typeof n.text !== "string")) return false;
    if (n.marks !== undefined && (!Array.isArray(n.marks) || !n.marks.every(m => m && typeof m === "object" && typeof m.type === "string"))) return false;
    return n.content === undefined || (Array.isArray(n.content) && n.content.every(child => validNode(child, depth + 1)));
  }
  return validNode(c.body, 0) && JSON.stringify(c.body).length <= 2000000;
}
export function validateBlogPost(value: unknown): string {
  if (!value || typeof value !== "object") return "Invalid post.";
  const post = value as BlogPost;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post.id ?? "")) return "Invalid post ID.";
  if (!Number.isSafeInteger(post.revision) || post.revision < 0 || typeof post.trashed !== "boolean") return "Invalid post revision.";
  if (!validContent(post.draft) || (post.published !== null && !validContent(post.published))) return "Post content is invalid or too large. Export your writing before reloading.";
  if (post.published) return publicationError({ ...post, draft: post.published }, []);
  return "";
}
