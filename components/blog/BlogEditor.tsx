"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { BLOG_CATEGORIES, postStatus, publicationError, publishPost, safeBlogUrl, slugify, wordCount, type BlogContent, type BlogPost } from "@/lib/blog";
import { downloadBlog, flushPost, storePost, useBlogPosts } from "./blog-store";
import { blogDescription } from "@/lib/blog-seo";
import { ArticleView, BlogImage } from "./BlogReader";
import { BlogAdminShell } from "./BlogAdmin";
import { optimizeEditorImage } from "./editor-images";

const CreditedImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), credit: { default: '', rendered: false }, receiptUrl: { default: '', rendered: false } }; },
});

export function StudioDialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className={`studio-dialog ${wide ? "studio-dialog-wide" : ""}`} onCancel={onClose} aria-label={title}><header><h2>{title}</h2><button aria-label="Close dialog" onClick={onClose}>×</button></header>{children}</dialog>;
}
export default function BlogEditor({ id }: { id: string }) {
  const { posts, error } = useBlogPosts();
  const post = posts?.find(p => p.id === id);
  return <BlogAdminShell>{!posts ? <p className="studio-empty">Opening your draft…</p> : !post || post.trashed ? <div className="studio-empty"><h1>Post not available</h1><p>Check the post list or restore this post from Trash.</p><Link href="/admin/blog">← All posts</Link></div> : <WritingDesk key={id} initial={post} storageError={error} />}</BlogAdminShell>;
}
function WritingDesk({ initial, storageError }: { initial: BlogPost; storageError: string }) {
  const { posts, error: remoteError, saving } = useBlogPosts();
  const [post, setPost] = useState(initial);
  const current = useRef(initial);
  const [localError, setError] = useState(storageError);
  const error = localError || remoteError;
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState(false);
  const [dialog, setDialog] = useState<"preview" | "publish" | "link" | "image" | null>(null);
  const [imageTarget, setImageTarget] = useState<"cover" | "body">("body");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [credit, setCredit] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const imageRequest = useRef<AbortController | null>(null);
  const [dialogError, setDialogError] = useState("");
  function save(next: BlogPost) {
    let result = next;
    try { result = storePost(next); setError(""); } catch(e) { setError((e as Error).message); }
    current.current = result; setPost(result);
    return result.revision !== next.revision;
  }
  function update(patch: Partial<BlogContent>) {
    const next = { ...current.current, draft: { ...current.current.draft, ...patch } };
    save(next); setNotice("");
  }
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, defaultProtocol: "https" } }), CreditedImage.configure({ allowBase64: true }), Placeholder.configure({ placeholder: "Tell your story. Start writing, or use the toolbar to add something…" })],
    content: initial.draft.body,
    immediatelyRender: false,
    editorProps: { attributes: { class: "studio-writing-body", role: "textbox", "aria-label": "Post content", "aria-multiline": "true" },
      handlePaste: (_view, event) => interceptImage(event.clipboardData),
      handleDrop: (_view, event, _slice, moved) => !moved && interceptImage(event.dataTransfer),
    },
    onUpdate: ({ editor: instance }) => update({ body: instance.getJSON() }),
  });
  const format = useEditorState({ editor, selector: ({ editor: e }) => ({ bold: e?.isActive("bold"), italic: e?.isActive("italic"), heading: e?.isActive("heading", { level: 2 }), quote: e?.isActive("blockquote"), list: e?.isActive("bulletList"), ordered: e?.isActive("orderedList"), link: e?.isActive("link") }) });
  useEffect(() => {
    if (!error && !saving && !imageBusy) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [error, saving, imageBusy]);
  useEffect(() => () => { imageRequest.current?.abort(); }, []);
  function openImage(target: "cover" | "body") { setImageTarget(target); setImageFile(null); setUrl(""); setAlt(""); setCredit(""); setDialogError(""); setDialog("image"); }
  function closeImage() { imageRequest.current?.abort(); imageRequest.current = null; setImageBusy(false); setDialog(null); }
  function interceptImage(data: DataTransfer | null) {
    const file = Array.from(data?.files ?? []).find(f => f.type.startsWith('image/'));
    const html = data?.getData('text/html') || '';
    const image = html.includes('<img') ? new DOMParser().parseFromString(html, 'text/html').querySelector('img') : null;
    if (!file && !image) return false;
    openImage('body');
    if (file) void loadImage(file);
    else { setUrl(image?.getAttribute('src') ?? ''); setAlt(image?.getAttribute('alt') ?? ''); }
    return true;
  }
  async function insertImage() {
    if (imageBusy) return;
    if ((!imageFile && !safeBlogUrl(url, true)) || !alt.trim() || !credit.trim()) { setDialogError("Choose an image, add descriptive alt text, and include its credit and reuse license."); return; }
    const controller = new AbortController(); imageRequest.current = controller;
    setImageBusy(true); setDialogError('');
    try {
      const image = await optimizeEditorImage(imageFile ?? url, controller.signal);
      if (controller.signal.aborted) return;
      const attribution = credit.trim() + ' Resized as WebP; full composition retained.';
      if (imageTarget === "cover") update({ cover: image.src, coverAlt: alt.trim(), coverCredit: attribution });
      else editor?.chain().focus().insertContent({ type: 'image', attrs: { src: image.src, alt: alt.trim(), credit: attribution, receiptUrl: image.receiptUrl } }).run();
      setDialog(null); setNotice('Image optimized and added.');
    } catch (e) { if (!controller.signal.aborted) setDialogError((e as Error).message); }
    finally { if (imageRequest.current === controller) { imageRequest.current = null; setImageBusy(false); } }
  }
  async function loadImage(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"].includes(file.type) || file.size > 4_000_000) { setImageFile(null); setUrl(''); setDialogError("Choose a JPG, PNG, WebP, AVIF or TIFF image under 4 MB."); return; }
    setImageFile(file); setUrl(''); setDialogError('');
  }
  async function publish() {
    try {
      const next = publishPost(current.current, posts ?? [], new Date().toISOString());
      if (save(next)) { await flushPost(next.id); setDialog(null); setNotice("Published to the journal."); }
      else setDialogError("Publishing could not be saved. Close this dialog and export your post before leaving.");
    } catch(e) { setDialogError((e as Error).message); }
  }
  function setLink() {
    if (!url.trim()) { editor?.chain().focus().extendMarkRange("link").unsetLink().run(); setDialog(null); return; }
    if (!safeBlogUrl(url)) { setDialogError("Use an HTTPS, mailto, or local site link."); return; }
    const chain = editor?.chain().focus();
    if (editor?.state.selection.empty && !editor.isActive("link")) chain?.insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }).run();
    else chain?.extendMarkRange("link").setLink({ href: url }).run();
    setDialog(null);
  }
  const content = post.draft;
  return <>
    <header className="studio-editor-top"><div><Link href="/admin/blog">← Posts</Link><span className="studio-status">{postStatus(post)}</span><span className="studio-save-state" role="status">{error ? "Changes not saved" : saving ? "Saving to InsForge…" : "✓ Saved to InsForge"}</span></div><div><button onClick={() => setDialog("preview")}>Preview</button><button aria-label="Post settings" aria-expanded={settings} className={settings ? "studio-tool-active" : ""} onClick={() => setSettings(!settings)}>Settings</button><button className="studio-primary" onClick={() => { setDialogError(""); setDialog("publish"); }}>{post.published ? "Publish changes" : "Publish"} ↗</button></div></header>
    {(error || notice) && <div className={`studio-notice ${error ? "studio-error" : ""}`} role={error ? "alert" : "status"}>{error || notice}{error && <button onClick={() => { void flushPost(post.id).catch(() => {}); }}>Retry save</button>}{error && <button onClick={() => downloadBlog("unsaved-post.json", current.current)}>Export unsaved post ↓</button>}{notice && post.published && <Link href={`/blog/${post.published.slug}`}>View post →</Link>}</div>}
    <div className={`studio-editor-layout ${settings ? "with-settings" : ""}`}><div className="studio-paper-wrap"><div className="studio-paper">
      {content.cover ? <div className="studio-cover"><BlogImage key={content.cover} src={content.cover} alt={content.coverAlt} /><div><button onClick={() => openImage("cover")}>Change cover</button><button onClick={() => update({ cover: "", coverAlt: "", coverCredit: "" })}>Remove cover</button></div></div> : <button className="studio-add-cover" onClick={() => openImage("cover")}>▧ <span>Add a cover image</span><small>Set the scene for your story</small></button>}
      <p className="studio-overline">{content.category}</p>
      <label className="sr-only" htmlFor="post-title">Post title</label><textarea id="post-title" className="studio-title-input" rows={2} placeholder="Your story starts here…" maxLength={200} value={content.title} onChange={e => update({ title: e.target.value, slug: !content.slug || content.slug === slugify(content.title) ? slugify(e.target.value) : content.slug })} />
      <div className="studio-editor-toolbar" role="toolbar" aria-label="Text formatting">
        <button title="Bold (Ctrl+B)" aria-label="Bold" aria-pressed={!!format?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button title="Italic (Ctrl+I)" aria-label="Italic" aria-pressed={!!format?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></button><span className="studio-tool-divider" />
        <button aria-label="Heading" aria-pressed={!!format?.heading} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button aria-label="Block quote" aria-pressed={!!format?.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</button>
        <button aria-label="Bullet list" aria-pressed={!!format?.list} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
        <button aria-label="Numbered list" aria-pressed={!!format?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button aria-label="Insert link" aria-pressed={!!format?.link} onClick={() => { setUrl(editor?.getAttributes("link").href ?? ""); setDialogError(""); setDialog("link"); }}>Link</button>
        <button aria-label="Insert image" onClick={() => openImage("body")}>+ Image</button><button aria-label="Insert divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>―</button><span className="studio-tool-divider" /><button aria-label="Undo" onClick={() => editor?.chain().focus().undo().run()}>↶</button><button aria-label="Redo" onClick={() => editor?.chain().focus().redo().run()}>↷</button>
      </div>
      <EditorContent editor={editor} />
      <footer className="studio-wordcount"><span>{wordCount(content.body)} words</span><span>Made for your own words.</span></footer>
    </div></div>
    {settings && <aside className="studio-settings" aria-label="Post settings"><div className="studio-settings-heading"><h2>Post settings</h2><button aria-label="Close settings" onClick={() => setSettings(false)}>×</button></div>
      <label>URL slug<input value={content.slug} maxLength={100} onChange={e => update({ slug: e.target.value })} /><small>/blog/{content.slug || "your-post"}</small></label>
      <label>Author<input value={content.author} maxLength={100} onChange={e => update({ author: e.target.value })} /></label>
      <label>Category<select value={content.category} onChange={e => update({ category: e.target.value })}>{BLOG_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Excerpt<textarea rows={4} value={content.excerpt} maxLength={300} placeholder="A short introduction for the journal…" onChange={e => update({ excerpt: e.target.value })} /><small>{content.excerpt.length}/300 characters</small></label>
      {content.cover && <><label>Cover alt text<input value={content.coverAlt} onChange={e => update({ coverAlt: e.target.value })} /></label><label>Image credit<input value={content.coverCredit} placeholder="Artist, source, or photographer" onChange={e => update({ coverCredit: e.target.value })} /></label></>}
      <section className="studio-seo-preview" aria-label="Search preview"><h3>Search preview</h3><small>saintdiscoveryquiz.com › blog › {content.slug || "your-post"}</small><strong>{content.title || "Give your article a clear, specific title"} | Saint Discovery</strong><p>{blogDescription(content) || "Write an excerpt that explains what readers will learn."}</p><p className="studio-seo-hint">Answer one clear question. Cite reliable sources and link to relevant saint biographies or guides. Search engines may choose different snippet text.</p></section><div className="studio-ad-setting"><label><input type="checkbox" checked={content.ads} onChange={e => update({ ads: e.target.checked })} /> Show ad placements</label><p>Reserves a sidebar and, for longer stories, an in-article space. No ad network is connected.</p></div>
      <button className="studio-export" onClick={() => downloadBlog(`${content.slug || "my-post"}.json`, post)}>Export this post ↓</button>
      {post.published && <button className="studio-export" onClick={async () => { if (save({ ...current.current, published: null, publishedAt: null })) { try { await flushPost(post.id); setNotice("Post returned to draft and removed from the journal."); } catch (e) { setError((e as Error).message); } } }}>Unpublish</button>}
    </aside>}
    </div>
    {dialog === "preview" && <StudioDialog title="Reading preview" onClose={() => setDialog(null)} wide><div className="studio-preview"><p className="studio-preview-note">Preview of your current draft, including ad placements.</p><ArticleView content={content} date={post.publishedAt} preview /></div></StudioDialog>}
    {dialog === "publish" && <StudioDialog title={post.published ? "Ready to share your changes?" : "Ready for your readers?"} onClose={() => setDialog(null)}><div className="studio-dialog-body"><p className="studio-overline">Publish to the journal</p><h3>{content.title || "Untitled post"}</h3><p>This publishes the current draft for all journal readers. It does not send any emails.</p><p className="studio-publish-url">/blog/{content.slug || "your-post"}</p>{(dialogError || publicationError(post, posts ?? [])) && <p className="studio-error" role="alert">{dialogError || publicationError(post, posts ?? [])}</p>}<button className="studio-primary" disabled={!!publicationError(post, posts ?? []) || !!error} onClick={publish}>Publish →</button></div></StudioDialog>}
    {dialog === "link" && <StudioDialog title="Add a link" onClose={() => setDialog(null)}><form className="studio-dialog-body" onSubmit={e => { e.preventDefault(); setLink(); }}><label>Link destination<input autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="https://… or /saints/francis-of-assisi" /></label><p>Links apply to selected text. With no selection, a new link is inserted. Clear the field to remove a selected link.</p>{dialogError && <p role="alert" className="studio-error">{dialogError}</p>}<button className="studio-primary" type="submit">Save link</button></form></StudioDialog>}
    {dialog === "image" && <StudioDialog title={imageTarget === "cover" ? "Add a cover image" : "Add an image"} onClose={closeImage}><form className="studio-dialog-body" onSubmit={e => { e.preventDefault(); void insertImage(); }} aria-busy={imageBusy}>
      <label>Upload an image<input disabled={imageBusy} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/tiff" onChange={e => void loadImage(e.target.files?.[0])} /><small>JPG, PNG, WebP, AVIF or TIFF · up to 4 MB</small></label>
      {imageFile && <p>{imageFile.name} selected</p>}
      <label>Or use an image URL<input disabled={imageBusy} value={url} onChange={e => { setImageFile(null); setUrl(e.target.value); }} placeholder="https://…" /><small>Wikimedia Commons, The Met, or images already on this site. For other sources, upload the downloaded file.</small></label>
      <label>Alt text<input disabled={imageBusy} required maxLength={1000} value={alt} onChange={e => setAlt(e.target.value)} placeholder="Describe what is in the image" /></label>
      <label>Image credit and license<textarea disabled={imageBusy} required maxLength={950} value={credit} onChange={e => setCredit(e.target.value)} placeholder="Artist, work title, source URL, and reuse license; or credit your original photograph" /></label>
      <p>Use images you have permission to publish. Images are compressed automatically, keeping the full composition. Inserted images are stored publicly, even while the post is a draft.</p>
      {dialogError && <p role="alert" className="studio-error">{dialogError}</p>}
      <button disabled={imageBusy} className="studio-primary" type="submit">{imageBusy ? 'Optimizing image…' : 'Insert image'}</button>
    </form></StudioDialog>}
  </>;
}
