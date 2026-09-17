import type { JSONContent } from "@tiptap/core";

export const BLOG_STORAGE_KEY = "saint-discovery.blog-prototype.v1";
export const BLOG_CATEGORIES = ["Everyday faith", "Meet the saints", "Prayer & reflection", "Living the seasons"];
export interface BlogContent {
  title: string; slug: string; excerpt: string; author: string; category: string;
  cover: string; coverAlt: string; coverCredit: string; body: JSONContent; ads: boolean;
}
export interface BlogPost {
  id: string; revision: number; updatedAt: string; publishedAt: string | null;
  draft: BlogContent; published: BlogContent | null; trashed: boolean;
}
export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}
export function safeBlogUrl(value: unknown, image = false): string {
  if (typeof value !== "string") return "";
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  if (image && /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)) return value;
  try { const url = new URL(value); return (url.protocol === "https:" || (!image && url.protocol === "mailto:")) ? value : ""; } catch { return ""; }
}
export function bodyText(node: JSONContent): string {
  return node.text ?? (node.content ?? []).map(bodyText).join(" ");
}
export function wordCount(body: JSONContent) { return bodyText(body).trim().split(/\s+/).filter(Boolean).length; }
export function readingTime(body: JSONContent) { return Math.max(1, Math.ceil(wordCount(body) / 220)); }
export function postStatus(post: BlogPost) {
  if (post.trashed) return "Trash";
  if (!post.published) return "Draft";
  return JSON.stringify(post.draft) === JSON.stringify(post.published) ? "Published" : "Unpublished changes";
}
export function publicationError(post: BlogPost, posts: BlogPost[]) {
  const content = post.draft;
  if (!content.title.trim()) return "Add a title before publishing.";
  if (!content.slug || slugify(content.slug) !== content.slug) return "Use a URL slug with lowercase letters, numbers, and hyphens.";
  if (!bodyText(content.body).trim()) return "Write some post content before publishing.";
  if (!content.author.trim()) return "Add an author name.";
  if (content.cover && (!safeBlogUrl(content.cover, true) || !content.coverAlt.trim())) return "Add a valid cover image and descriptive alt text.";
  if (posts.some(other => other.id !== post.id && !other.trashed && (other.published?.slug === content.slug || other.draft.slug === content.slug))) return "That URL slug is already used by another post.";
  return "";
}
export function publishPost(post: BlogPost, posts: BlogPost[], now: string): BlogPost {
  const error = publicationError(post, posts);
  if (error) throw new Error(error);
  return { ...post, published: structuredClone(post.draft), publishedAt: post.publishedAt ?? now, updatedAt: now };
}
export function newBlogPost(id: string, now: string): BlogPost {
  return { id, revision: 0, updatedAt: now, publishedAt: null, published: null, trashed: false,
    draft: { title: "", slug: "", excerpt: "", author: "Saint Discovery", category: BLOG_CATEGORIES[0], cover: "", coverAlt: "", coverCredit: "", ads: true, body: { type: "doc", content: [{ type: "paragraph" }] } } };
}
const p = (text: string): JSONContent => ({ type: "paragraph", content: [{ type: "text", text }] });
const h = (text: string): JSONContent => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text }] });
const date = "2026-09-16T12:00:00.000Z";
function sample(id: string, title: string, excerpt: string, category: string, body: JSONContent[], published = true): BlogPost {
  const draft: BlogContent = { title, slug: slugify(title), excerpt, author: "Saint Discovery", category, cover: published && id === "sample-quiet" ? "/images/sacred-art.webp" : "", coverAlt: published && id === "sample-quiet" ? "Sacred artwork from the Saint Discovery collection" : "", coverCredit: "", body: { type: "doc", content: body }, ads: true };
  return { id, revision: 0, updatedAt: date, publishedAt: published ? date : null, draft, published: published ? structuredClone(draft) : null, trashed: false };
}
export const SAMPLE_POSTS: BlogPost[] = [
  sample("sample-quiet", "Making room for a quieter kind of faith", "A few unhurried minutes. A familiar prayer. One small act of kindness. An invitation to notice what is already in front of you.", "Everyday faith", [
    p("There are days when faith feels less like a grand gesture and more like making room. Room to listen, to pause before answering, or to give another person our full attention. We can begin there, in the ordinary details of the day."),
    h("Begin with what you have"), p("Choose a moment that already belongs to your routine: the first cup of coffee, the walk to your car, or the quiet before sleep. Let that moment become an invitation to prayer rather than another task to complete."),
    { type: "blockquote", content: [p("What would change if I gave this moment my full attention?")] },
    p("You do not need the perfect words. You might name someone you are worried about, give thanks for one good thing, or simply sit in silence. A small beginning is still a beginning."),
    h("Let reflection become action"), p("Carry one intention into the day. Listen without rushing to reply. Reach out to someone who has been on your mind. Make a little room for generosity in a situation that usually feels hurried."),
    p("These are invitations, not a measure of how well you are doing. Return to what helps you be present to God and to the people around you."),
  ]),
  sample("sample-companion", "A saint to walk with, not a checklist to finish", "How to make a saint’s biography the beginning of a personal reflection.", "Meet the saints", [p("A name, a place, a question: sometimes that is all it takes to begin exploring a saint's story. You do not have to recognize yourself in every part of a life to find something worth thinking about."), h("Read with a question in mind"), p("Notice the choices the person faced. What did care for others look like in that setting? What remains uncertain in the historical record? Our sourced biographies are a starting point for reading thoughtfully."), p("After reading, choose one question to carry with you. Discuss it with a friend, your sponsor, or someone in your parish. The point is to begin a conversation, not to collect a perfect answer.")]),
  sample("sample-evening", "An evening pause: three questions for reflection", "A gentle way to bring the day into prayer, one question at a time.", "Prayer & reflection", [p("Before moving on to tomorrow, take a moment to notice today. These original reflection prompts can be used in a journal or quietly in prayer."), h("Where did I notice goodness?"), p("Remember a gesture, conversation, or moment of beauty. Give thanks for it, however small it seemed."), h("Where could I have loved more generously?"), p("Consider one moment honestly and without turning it into a judgment on your whole day. Ask for forgiveness or make a plan to put something right if needed."), h("What do I need to entrust to God?"), p("Name one concern you cannot resolve tonight. Let prayer make space for rest and for beginning again tomorrow.")]),
  sample("sample-season", "Notes for a new season", "An unfinished idea for your next article.", "Living the seasons", [p("What would you like to share with your readers this season? Use this draft as a starting point, or create a new post of your own.")], false),
];
