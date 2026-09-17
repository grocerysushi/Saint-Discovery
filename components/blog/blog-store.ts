"use client";
import { useEffect, useSyncExternalStore } from "react";
import { BLOG_STORAGE_KEY, type BlogPost } from "@/lib/blog";
type Scope = "admin" | "public";
type State = { posts: BlogPost[] | null; error: string; saving: boolean };
const empty: State = { posts: null, error: "", saving: false };
const states: Record<Scope, State> = { admin: empty, public: empty };
const listeners: Record<Scope, Set<() => void>> = { admin: new Set(), public: new Set() };
const loading = new Set<Scope>();
type Pending = { post: BlogPost; remoteRevision: number; savedVersion: number; timer?: ReturnType<typeof setTimeout>; running?: Promise<void>; error: string };
const pending = new Map<string, Pending>();
function emit(scope: Scope, patch: Partial<State>) {
  states[scope] = { ...states[scope], ...patch };
  listeners[scope].forEach(fn => fn());
}
export async function blogRequest(url: string, options?: RequestInit, retry = true): Promise<Record<string, unknown>> {
  const response = await fetch(url, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", ...options?.headers } });
  if (response.status === 401 && retry) {
    const refresh = await fetch("/api/blog/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refresh" }) });
    if (refresh.ok) return blogRequest(url, options, false);
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The connection failed. Please try again.");
  return data;
}
async function load(scope: Scope) {
  if (loading.has(scope) || states[scope].posts) return;
  loading.add(scope);
  try {
    const data = await blogRequest(scope === "admin" ? "/api/blog/admin/posts" : "/api/blog/posts");
    emit(scope, { posts: data.posts as BlogPost[], error: "" });
  } catch (e) { emit(scope, { error: (e as Error).message }); }
  finally { loading.delete(scope); }
}
function syncStatus() {
  const entries = [...pending.values()];
  emit("admin", { saving: entries.some(p => p.post.revision !== p.savedVersion), error: entries.find(p => p.error)?.error ?? "" });
}
export function storePost(post: BlogPost): BlogPost {
  const posts = states.admin.posts;
  if (!posts) throw new Error("Wait for your posts to load before saving.");
  const existing = posts.find(p => p.id === post.id);
  if (existing && existing.revision !== post.revision) throw new Error("This post changed. Export your writing and reload.");
  const next = { ...post, revision: post.revision + 1, updatedAt: new Date().toISOString() };
  let entry = pending.get(post.id);
  if (!entry) { entry = { post: next, remoteRevision: post.revision, savedVersion: post.revision, error: "" }; pending.set(post.id, entry); }
  entry.post = next;
  clearTimeout(entry.timer);
  // Recovery copies never count as successful database saves.
  try { localStorage.setItem(`saint-blog-recovery:${post.id}`, JSON.stringify(next)); } catch { /* Export remains available. */ }
  emit("admin", { posts: existing ? posts.map(p => p.id === post.id ? next : p) : [next, ...posts] });
  syncStatus();
  if (!entry.error) entry.timer = setTimeout(() => { void flushPost(post.id).catch(() => {}); }, 600);
  return next;
}
export async function flushPost(id: string): Promise<void> {
  const entry = pending.get(id);
  if (!entry) return;
  clearTimeout(entry.timer);
  if (entry.running) return entry.running;
  entry.error = "";
  entry.running = (async () => {
    try {
      while (entry.post.revision !== entry.savedVersion) {
        const sent = entry.post;
        const result = await blogRequest("/api/blog/admin/posts", { method: "PUT", body: JSON.stringify({ ...sent, revision: entry.remoteRevision }) });
        const saved = result.post as BlogPost;
        entry.remoteRevision = saved.revision;
        entry.savedVersion = sent.revision;
        if (entry.post.revision === sent.revision) {
          try { localStorage.removeItem(`saint-blog-recovery:${id}`); } catch { /* Optional cleanup. */ }
        }
        emit("public", { posts: null });
      }
    } catch (e) { entry.error = (e as Error).message; throw e; }
    finally { entry.running = undefined; syncStatus(); }
  })();
  syncStatus();
  return entry.running;
}
export function useBlogPosts(scope: Scope = "admin") {
  const state = useSyncExternalStore(callback => {
    listeners[scope].add(callback);
    return () => { listeners[scope].delete(callback); };
  }, () => states[scope], () => empty);
  useEffect(() => { if (!state.posts) void load(scope); }, [scope, state.posts]);
  return state;
}
export async function importLocalDrafts() {
  const raw = localStorage.getItem(BLOG_STORAGE_KEY);
  const values: BlogPost[] = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(values)) throw new Error("The old browser backup could not be read.");
  let count = 0;
  for (const post of values) {
    if (post.id.startsWith("sample-") || post.trashed || states.admin.posts?.some(p => p.id === post.id)) continue;
    if (!/^[0-9a-f-]{36}$/i.test(post.id) || post.draft?.body?.type !== "doc") continue;
    const saved = storePost({ ...post, revision: 0, published: null, publishedAt: null });
    await flushPost(saved.id); count++;
  }
  return count;
}
export function exportRecoveryCopies() {
  const copies = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("saint-blog-recovery:")) copies.push(JSON.parse(localStorage.getItem(key) || "null"));
  }
  downloadBlog("saint-discovery-recovery.json", { posts: copies });
}
export function downloadBlog(filename: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
