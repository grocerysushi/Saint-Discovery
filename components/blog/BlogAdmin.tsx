"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { newBlogPost, postStatus, type BlogPost } from "@/lib/blog";
import { blogRequest, downloadBlog, exportRecoveryCopies, flushPost, importLocalDrafts, storePost, useBlogPosts } from "./blog-store";

export function BlogAdminShell({ children }: { children: ReactNode }) {
  const { saving, error } = useBlogPosts();
  const [signoutError, setSignoutError] = useState("");
  useEffect(() => {
    if (!saving && !error) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saving, error]);
  async function signout() {
    try { await blogRequest("/api/blog/auth", { method: "POST", body: JSON.stringify({ action: "signout" }) }); window.location.assign("/admin/blog"); }
    catch { setSignoutError("Sign-out failed. Please try again."); }
  }
  return <div className="blog-admin"><aside className="studio-sidebar"><Link href="/admin/blog" className="studio-brand"><span className="brand-mark" aria-hidden>✦</span><span>Saint Discovery<small>Writing studio</small></span></Link><p className="studio-nav-label">Your publication</p><nav aria-label="Blog administration"><Link href="/admin/blog" className="studio-nav-current">▤ <span>Posts</span></Link><Link href="/blog">↗ <span>View journal</span></Link><Link href="/">⌂ <span>Main site</span></Link></nav><div className="studio-sidebar-bottom"><span className="studio-local-dot" /> Connected to InsForge<p>Drafts stay private until you publish. Your writing is saved securely online.</p><button disabled={saving} onClick={() => void signout()}>Sign out</button>{signoutError && <p role="alert">{signoutError}</p>}</div></aside><div className="studio-main">{children}</div></div>;
}
export default function BlogAdmin() {
  const router = useRouter();
  const { posts, error, saving } = useBlogPosts();
  const [filter, setFilter] = useState("All posts");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [trashTarget, setTrashTarget] = useState<BlogPost | null>(null);
  const trashDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (trashTarget) trashDialog.current?.showModal(); }, [trashTarget]);
  const visible = (posts ?? []).filter(p => (filter === "Trash" ? p.trashed : !p.trashed) && (filter === "Drafts" ? !p.published : filter === "Published" ? !!p.published : true) && p.draft.title.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  async function create() { try { const post = storePost(newBlogPost(crypto.randomUUID(), new Date().toISOString())); await flushPost(post.id); router.push(`/admin/blog/${post.id}`); } catch(e) { setNotice((e as Error).message); } }
  async function trash(post: BlogPost, value: boolean) { try { storePost({ ...post, trashed: value }); await flushPost(post.id); setTrashTarget(null); setNotice(value ? "Post moved to trash. You can restore it at any time." : "Post restored."); } catch(e) { setNotice((e as Error).message); } }
  return <BlogAdminShell><header className="studio-page-heading"><div><p className="studio-overline">Make room for your next story</p><h1>Posts<span>{posts?.filter(p => !p.trashed).length ?? "—"}</span></h1><p>Your ideas, from the first sentence to the finished piece.</p></div><button className="studio-primary" onClick={create} disabled={!posts || saving}>+ New post</button></header>
    <div className="studio-prototype"><span>✦</span><p><strong>Your writing, saved online.</strong> Drafts are private. Publishing makes a story available to journal readers.</p><Link href="/blog">View journal ↗</Link></div>
    <section className="studio-posts"><div className="studio-post-tools"><div className="studio-tabs" role="group" aria-label="Filter posts">{["All posts", "Drafts", "Published", "Trash"].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}</div><input aria-label="Search posts" type="search" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)} /></div>
    {(notice || error) && <p className="studio-notice" role="status">{notice || error}</p>}
    <div className="studio-table-heading"><span>Story</span><span>Status</span><span>Last edited</span><span>Actions</span></div>
    {!posts ? <p className="studio-empty">Loading posts…</p> : !visible.length ? <div className="studio-empty"><h2>{filter === "Trash" ? "Nothing in the trash." : "A fresh page awaits."}</h2><p>{search ? "Try another search." : "Create a post and let your next idea take shape."}</p></div> : visible.map(post => <div className="studio-post-row" key={post.id}><Link href={`/admin/blog/${post.id}`} className="studio-post-title"><span className="studio-post-icon" aria-hidden>{post.published ? "▤" : "✎"}</span><div><h2>{post.draft.title || "Untitled post"}</h2><p>{post.draft.category} <span>· {post.draft.author}</span></p></div></Link><span className={`studio-status ${post.published ? "is-published" : ""}`}>{postStatus(post)}</span><time dateTime={post.updatedAt}>{new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time><div className="studio-row-actions">{post.trashed ? <button onClick={() => trash(post, false)}>Restore</button> : <><Link href={`/admin/blog/${post.id}`} aria-label={`Edit ${post.draft.title || "untitled post"}`}>Edit</Link><button aria-label={`Move ${post.draft.title || "untitled post"} to trash`} onClick={() => setTrashTarget(post)}>Trash</button></>}</div></div>)}
    <footer className="studio-table-footer"><button onClick={exportRecoveryCopies}>Export recovery copies ↓</button><button disabled={!posts || saving} onClick={async () => { try { const count = await importLocalDrafts(); setNotice(`${count} browser drafts imported. Original browser copies are preserved.`); } catch (e) { setNotice((e as Error).message); } }}>Import old browser drafts</button><span>{visible.length} {visible.length === 1 ? "post" : "posts"}</span><button disabled={!posts || saving} onClick={() => downloadBlog("saint-discovery-blog-backup.json", { version: 1, posts })}>Export all posts ↓</button></footer></section>
    <div className="studio-bottom-cards"><section><p className="studio-overline">Your words, your space</p><h2>Start with something small.</h2><p>A reflection, a saint who inspires you, or a question worth exploring. Every story begins with a first line.</p><button onClick={create} disabled={!posts || saving}>Write a new story →</button></section><section><p className="studio-overline">Designed for the blog</p><h2>Room for advertising.</h2><p>Banner, sidebar, and in-article placements are reserved in the reading layout. You can turn them off for individual posts. The rest of Saint Discovery stays ad-free.</p><Link href="/blog">See the placements →</Link></section></div>
    {trashTarget && <dialog ref={trashDialog} className="studio-dialog" onCancel={() => setTrashTarget(null)} aria-labelledby="trash-title"><div className="studio-dialog-body"><h2 id="trash-title">Move this post to trash?</h2><p>“{trashTarget.draft.title || "Untitled post"}” will disappear from the journal. You can restore it from Trash.</p><button className="studio-primary" autoFocus onClick={() => trash(trashTarget, true)}>Move to trash</button><button className="ml-5" onClick={() => setTrashTarget(null)}>Cancel</button></div></dialog>}
  </BlogAdminShell>;
}
