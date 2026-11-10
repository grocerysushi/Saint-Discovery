"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { newBlogPost, postStatus, type BlogPost } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { blogRequest, downloadBlog, exportRecoveryCopies, flushPost, importLocalDrafts, storePost, useBlogPosts } from "./blog-store";

const POST_FILTERS = ["All posts", "Drafts", "Published", "Trash"];

export function BlogAdminShell({ children }: { children: ReactNode }) {
  const { saving, error } = useBlogPosts();
  useEffect(() => {
    if (!saving && !error) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saving, error]);
  async function signout() {
    try { await blogRequest("/api/blog/auth", { method: "POST", body: JSON.stringify({ action: "signout" }) }); window.location.assign("/admin/blog"); }
    catch { toast.error("Sign-out failed. Please try again."); }
  }
  return (
    <div className="blog-admin">
      <aside className="studio-sidebar">
        <Link href="/admin/blog" className="studio-brand">
          <span className="brand-mark" aria-hidden>✦</span>
          <span>Saint Discovery<small>Writing studio</small></span>
        </Link>
        <p className="studio-nav-label">Your publication</p>
        <nav aria-label="Blog administration">
          <Link href="/admin/blog" className="studio-nav-current">▤ <span>Posts</span></Link>
          <Link href="/blog">↗ <span>View blog</span></Link>
          <Link href="/">⌂ <span>Main site</span></Link>
        </nav>
        <div className="studio-sidebar-bottom">
          <span className="studio-local-dot" /> Connected to InsForge
          <p>Drafts stay private until you publish. Your writing is saved securely online.</p>
          <Button variant="ghost" className="studio-text-button" disabled={saving} onClick={() => void signout()}>
            Sign out
          </Button>
        </div>
      </aside>
      <div className="studio-main">{children}</div>
    </div>
  );
}

export default function BlogAdmin() {
  const router = useRouter();
  const { posts, error, saving } = useBlogPosts();
  const [filter, setFilter] = useState("All posts");
  const [search, setSearch] = useState("");
  const [trashTarget, setTrashTarget] = useState<BlogPost | null>(null);
  const visible = (posts ?? []).filter(p => (filter === "Trash" ? p.trashed : !p.trashed) && (filter === "Drafts" ? !p.published : filter === "Published" ? !!p.published : true) && p.draft.title.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  async function create() { try { const post = storePost(newBlogPost(crypto.randomUUID(), new Date().toISOString())); await flushPost(post.id); router.push(`/admin/blog/${post.id}`); } catch(e) { toast.error((e as Error).message); } }
  async function trash(post: BlogPost, value: boolean) { try { storePost({ ...post, trashed: value }); await flushPost(post.id); setTrashTarget(null); toast.success(value ? "Post moved to trash. You can restore it at any time." : "Post restored."); } catch(e) { toast.error((e as Error).message); } }
  async function importDrafts() { try { const count = await importLocalDrafts(); toast.success(`${count} browser drafts imported. Original browser copies are preserved.`); } catch (e) { toast.error((e as Error).message); } }
  return <BlogAdminShell>
    <header className="studio-page-heading">
      <div>
        <p className="studio-overline">Make room for your next story</p>
        <h1>Posts<span>{posts?.filter(p => !p.trashed).length ?? "—"}</span></h1>
        <p>Your ideas, from the first sentence to the finished piece.</p>
      </div>
      <Button className="studio-primary" onClick={create} disabled={!posts || saving}>+ New post</Button>
    </header>
    <div className="studio-prototype"><span>✦</span><p><strong>Your writing, saved online.</strong> Drafts are private. Publishing makes a story available to blog readers.</p><Link href="/blog">View blog ↗</Link></div>
    <Tabs value={filter} onValueChange={setFilter} className="block" render={<section className="studio-posts">
        <div className="studio-post-tools">
          <TabsList className="studio-tabs" aria-label="Filter posts">
            {POST_FILTERS.map(f => <TabsTrigger key={f} value={f}>{f}</TabsTrigger>)}
          </TabsList>
          <Input aria-label="Search posts" type="search" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {error && <p className="studio-notice" role="status">{error}</p>}
        <TabsContent value={filter} className="studio-posts-panel">
          <div className="studio-table-heading"><span>Story</span><span>Status</span><span>Last edited</span><span>Actions</span></div>
          {!posts ? <p className="studio-empty">Loading posts…</p> : !visible.length ? (
            <div className="studio-empty">
              <h2>{filter === "Trash" ? "Nothing in the trash." : "A fresh page awaits."}</h2>
              <p>{search ? "Try another search." : "Create a post and let your next idea take shape."}</p>
            </div>
          ) : visible.map(post => (
            <div className="studio-post-row" key={post.id}>
              <Link href={`/admin/blog/${post.id}`} className="studio-post-title">
                <span className="studio-post-icon" aria-hidden>{post.published ? "▤" : "✎"}</span>
                <div><h2>{post.draft.title || "Untitled post"}</h2><p>{post.draft.category} <span>· {post.draft.author}</span></p></div>
              </Link>
              <span className={`studio-status ${post.published ? "is-published" : ""}`}>{postStatus(post)}</span>
              <time dateTime={post.updatedAt}>{new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time>
              <div className="studio-row-actions">
                {post.trashed ? (
                  <Button variant="ghost" className="studio-text-button" onClick={() => trash(post, false)}>Restore</Button>
                ) : <>
                  <Link href={`/admin/blog/${post.id}`} aria-label={`Edit ${post.draft.title || "untitled post"}`}>Edit</Link>
                  <Button variant="ghost" className="studio-text-button" aria-label={`Move ${post.draft.title || "untitled post"} to trash`} onClick={() => setTrashTarget(post)}>Trash</Button>
                </>}
              </div>
            </div>
          ))}
        </TabsContent>
        <footer className="studio-table-footer">
          <Button variant="ghost" className="studio-text-button" onClick={exportRecoveryCopies}>Export recovery copies ↓</Button>
          <Button variant="ghost" className="studio-text-button" disabled={!posts || saving} onClick={importDrafts}>Import old browser drafts</Button>
          <span>{visible.length} {visible.length === 1 ? "post" : "posts"}</span>
          <Button variant="ghost" className="studio-text-button" disabled={!posts || saving} onClick={() => downloadBlog("saint-discovery-blog-backup.json", { version: 1, posts })}>Export all posts ↓</Button>
        </footer>
      </section>} />
    <div className="studio-bottom-cards">
      <section>
        <p className="studio-overline">Your words, your space</p>
        <h2>Start with something small.</h2>
        <p>A reflection, a saint who inspires you, or a question worth exploring. Every story begins with a first line.</p>
        <Button variant="ghost" className="studio-text-button" onClick={create} disabled={!posts || saving}>Write a new story →</Button>
      </section>
      <section>
        <p className="studio-overline">Designed for the blog</p>
        <h2>Space to read.</h2>
        <p>Saint Discovery is ad-free. Give readers a clear question, useful sources, and room to reflect.</p>
        <Link href="/blog">Visit the blog →</Link>
      </section>
    </div>
    <AlertDialog open={!!trashTarget} onOpenChange={open => { if (!open) setTrashTarget(null); }}>
      {trashTarget && (
        <AlertDialogContent className="studio-dialog">
          <div className="studio-dialog-body">
            <AlertDialogTitle className="font-normal">Move this post to trash?</AlertDialogTitle>
            <AlertDialogDescription>“{trashTarget.draft.title || "Untitled post"}” will disappear from the blog. You can restore it from Trash.</AlertDialogDescription>
            <AlertDialogAction
              className="studio-primary"
              autoFocus
              onClick={event => {
                // Keep the dialog open until the move succeeds, so failures stay in context.
                event.preventDefault();
                void trash(trashTarget, true);
              }}
            >
              Move to trash
            </AlertDialogAction>
            <AlertDialogCancel variant="ghost" className="studio-text-button ml-5">Cancel</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      )}
    </AlertDialog>
  </BlogAdminShell>;
}
