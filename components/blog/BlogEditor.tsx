"use client";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { BLOG_CATEGORIES, postStatus, publicationError, publishPost, safeBlogUrl, slugify, wordCount, type BlogContent, type BlogPost } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { downloadBlog, flushPost, storePost, useBlogPosts } from "./blog-store";
import { blogDescription } from "@/lib/blog-seo";
import { ArticleView, BlogImage } from "./BlogReader";
import { BlogAdminShell } from "./BlogAdmin";
import { optimizeEditorImage } from "./editor-images";

const CreditedImage = Image.extend({
  addAttributes() { return { ...this.parent?.(), credit: { default: '', rendered: false }, receiptUrl: { default: '', rendered: false } }; },
});

/** Text-style studio button: shadcn Button primitives with the studio's plain-text look (see .studio-text-button). */
function StudioTextButton(props: ComponentProps<typeof Button>) {
  return <Button variant="ghost" {...props} className={`studio-text-button ${props.className ?? ""}`.trim()} />;
}

export function StudioDialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    // Like the previous native <dialog>, only Escape or the close button dismisses it.
    <Dialog open disablePointerDismissal onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        className={`studio-dialog ${wide ? "studio-dialog-wide" : ""}`}
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <header>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose render={<StudioTextButton aria-label="Close dialog">×</StudioTextButton>} />
        </header>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export default function BlogEditor({ id }: { id: string }) {
  const { posts, error } = useBlogPosts();
  const post = posts?.find(p => p.id === id);
  return <BlogAdminShell>{!posts ? <p className="studio-empty">Opening your draft…</p> : !post || post.trashed ? <div className="studio-empty"><h1>Post not available</h1><p>Check the post list or restore this post from Trash.</p><Link href="/admin/blog">← All posts</Link></div> : <WritingDesk key={id} initial={post} storageError={error} />}</BlogAdminShell>;
}
function WritingDesk({ initial, storageError }: { initial: BlogPost; storageError: string }) {
  const router = useRouter();
  const { posts, error: remoteError, saving } = useBlogPosts();
  const [post, setPost] = useState(initial);
  const current = useRef(initial);
  const [localError, setError] = useState(storageError);
  const error = localError || remoteError;
  const [settings, setSettings] = useState(false);
  const [dialog, setDialog] = useState<"preview" | "publish" | "link" | "image" | "unpublish" | null>(null);
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
    save(next);
  }
  /** Action-result toast; offers the public link while the post is live (as the old notice bar did). */
  function notify(message: string) {
    const slug = current.current.published?.slug;
    toast.success(message, slug ? { action: { label: "View post →", onClick: () => router.push(`/blog/${slug}`) } } : undefined);
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
      setDialog(null); notify('Image optimized and added.');
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
      if (save(next)) { await flushPost(next.id); setDialog(null); notify("Published to the blog."); }
      else setDialogError("Publishing could not be saved. Close this dialog and export your post before leaving.");
    } catch(e) { setDialogError((e as Error).message); }
  }
  async function unpublish() {
    setDialog(null);
    if (save({ ...current.current, published: null, publishedAt: null })) {
      try { await flushPost(post.id); notify("Post returned to draft and removed from the blog."); } catch (e) { setError((e as Error).message); }
    }
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
    <header className="studio-editor-top">
      <div>
        <Link href="/admin/blog">← Posts</Link>
        <span className="studio-status">{postStatus(post)}</span>
        <span className="studio-save-state" role="status">{error ? "Changes not saved" : saving ? "Saving to InsForge…" : "✓ Saved to InsForge"}</span>
      </div>
      <div>
        <StudioTextButton onClick={() => setDialog("preview")}>Preview</StudioTextButton>
        <StudioTextButton aria-label="Post settings" aria-expanded={settings} className={settings ? "studio-tool-active" : ""} onClick={() => setSettings(!settings)}>Settings</StudioTextButton>
        <Button className="studio-primary" onClick={() => { setDialogError(""); setDialog("publish"); }}>{post.published ? "Publish changes" : "Publish"} ↗</Button>
      </div>
    </header>
    {error && (
      <div className="studio-notice studio-error" role="alert">
        {error}
        <StudioTextButton onClick={() => { void flushPost(post.id).catch(() => {}); }}>Retry save</StudioTextButton>
        <StudioTextButton onClick={() => downloadBlog("unsaved-post.json", current.current)}>Export unsaved post ↓</StudioTextButton>
      </div>
    )}
    <div className={`studio-editor-layout ${settings ? "with-settings" : ""}`}><div className="studio-paper-wrap"><div className="studio-paper">
      {content.cover ? (
        <div className="studio-cover">
          <BlogImage key={content.cover} src={content.cover} alt={content.coverAlt} />
          <div>
            <StudioTextButton onClick={() => openImage("cover")}>Change cover</StudioTextButton>
            <StudioTextButton onClick={() => update({ cover: "", coverAlt: "", coverCredit: "" })}>Remove cover</StudioTextButton>
          </div>
        </div>
      ) : (
        <StudioTextButton className="studio-add-cover" onClick={() => openImage("cover")}>▧ <span>Add a cover image</span><small>Set the scene for your story</small></StudioTextButton>
      )}
      <p className="studio-overline">{content.category}</p>
      <Label className="sr-only" htmlFor="post-title">Post title</Label>
      <Textarea id="post-title" className="studio-title-input" rows={2} placeholder="Your story starts here…" maxLength={200} value={content.title} onChange={e => update({ title: e.target.value, slug: !content.slug || content.slug === slugify(content.title) ? slugify(e.target.value) : content.slug })} />
      <div className="studio-editor-toolbar" role="toolbar" aria-label="Text formatting">
        <StudioTextButton title="Bold (Ctrl+B)" aria-label="Bold" aria-pressed={!!format?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></StudioTextButton>
        <StudioTextButton title="Italic (Ctrl+I)" aria-label="Italic" aria-pressed={!!format?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></StudioTextButton>
        <span className="studio-tool-divider" />
        <StudioTextButton aria-label="Heading" aria-pressed={!!format?.heading} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</StudioTextButton>
        <StudioTextButton aria-label="Block quote" aria-pressed={!!format?.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>❝</StudioTextButton>
        <StudioTextButton aria-label="Bullet list" aria-pressed={!!format?.list} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</StudioTextButton>
        <StudioTextButton aria-label="Numbered list" aria-pressed={!!format?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</StudioTextButton>
        <StudioTextButton aria-label="Insert link" aria-pressed={!!format?.link} onClick={() => { setUrl(editor?.getAttributes("link").href ?? ""); setDialogError(""); setDialog("link"); }}>Link</StudioTextButton>
        <StudioTextButton aria-label="Insert image" onClick={() => openImage("body")}>+ Image</StudioTextButton>
        <StudioTextButton aria-label="Insert divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>―</StudioTextButton>
        <span className="studio-tool-divider" />
        <StudioTextButton aria-label="Undo" onClick={() => editor?.chain().focus().undo().run()}>↶</StudioTextButton>
        <StudioTextButton aria-label="Redo" onClick={() => editor?.chain().focus().redo().run()}>↷</StudioTextButton>
      </div>
      <EditorContent editor={editor} />
      <footer className="studio-wordcount"><span>{wordCount(content.body)} words</span><span>Made for your own words.</span></footer>
    </div></div>
    {settings && (
      <aside className="studio-settings" aria-label="Post settings">
        <div className="studio-settings-heading">
          <h2>Post settings</h2>
          <StudioTextButton aria-label="Close settings" onClick={() => setSettings(false)}>×</StudioTextButton>
        </div>
        <Label>
          URL slug
          <Input value={content.slug} maxLength={100} onChange={e => update({ slug: e.target.value })} />
          <small>/blog/{content.slug || "your-post"}</small>
        </Label>
        <Label>
          Author
          <Input value={content.author} maxLength={100} onChange={e => update({ author: e.target.value })} />
        </Label>
        <Label htmlFor="post-category" className="studio-select-label">Category</Label>
        <Select value={content.category} onValueChange={category => { if (category) update({ category }); }}>
          <SelectTrigger id="post-category" className="studio-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="studio-popover" alignItemWithTrigger={false}>
            {BLOG_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Label>
          Excerpt
          <Textarea rows={4} value={content.excerpt} maxLength={300} placeholder="A short introduction for the blog…" onChange={e => update({ excerpt: e.target.value })} />
          <small>{content.excerpt.length}/300 characters</small>
        </Label>
        {content.cover && <>
          <Label>
            Cover alt text
            <Input value={content.coverAlt} onChange={e => update({ coverAlt: e.target.value })} />
          </Label>
          <Label>
            Image credit
            <Input value={content.coverCredit} placeholder="Artist, source, or photographer" onChange={e => update({ coverCredit: e.target.value })} />
          </Label>
        </>}
        <section className="studio-seo-preview" aria-label="Search preview"><h3>Search preview</h3><small>saintdiscoveryquiz.com › blog › {content.slug || "your-post"}</small><strong>{content.title || "Give your article a clear, specific title"} | Saint Discovery</strong><p>{blogDescription(content) || "Write an excerpt that explains what readers will learn."}</p><p className="studio-seo-hint">Answer one clear question. Cite reliable sources and link to relevant saint biographies or guides. Search engines may choose different snippet text.</p></section><p className="studio-seo-hint">Saint Discovery is ad-free. Articles have no advertising placements.</p>
        <StudioTextButton className="studio-export" onClick={() => downloadBlog(`${content.slug || "my-post"}.json`, post)}>Export this post ↓</StudioTextButton>
        {post.published && <StudioTextButton className="studio-export" onClick={() => setDialog("unpublish")}>Unpublish</StudioTextButton>}
      </aside>
    )}
    </div>
    {dialog === "preview" && <StudioDialog title="Reading preview" onClose={() => setDialog(null)} wide><div className="studio-preview"><p className="studio-preview-note">Preview of your current draft, including ad placements.</p><ArticleView content={content} date={post.publishedAt} preview /></div></StudioDialog>}
    {dialog === "publish" && (
      <StudioDialog title={post.published ? "Ready to share your changes?" : "Ready for your readers?"} onClose={() => setDialog(null)}>
        <div className="studio-dialog-body">
          <p className="studio-overline">Publish to the blog</p>
          <h3>{content.title || "Untitled post"}</h3>
          <p>This publishes the current draft for all blog readers. It does not send any emails.</p>
          <p className="studio-publish-url">/blog/{content.slug || "your-post"}</p>
          {(dialogError || publicationError(post, posts ?? [])) && <p className="studio-error" role="alert">{dialogError || publicationError(post, posts ?? [])}</p>}
          <Button className="studio-primary" disabled={!!publicationError(post, posts ?? []) || !!error} onClick={publish}>Publish →</Button>
        </div>
      </StudioDialog>
    )}
    {dialog === "link" && (
      <StudioDialog title="Add a link" onClose={() => setDialog(null)}>
        <form className="studio-dialog-body" onSubmit={e => { e.preventDefault(); setLink(); }}>
          <Label>
            Link destination
            <Input autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="https://… or /saints/francis-of-assisi" />
          </Label>
          <p>Links apply to selected text. With no selection, a new link is inserted. Clear the field to remove a selected link.</p>
          {dialogError && <p role="alert" className="studio-error">{dialogError}</p>}
          <Button className="studio-primary" type="submit">Save link</Button>
        </form>
      </StudioDialog>
    )}
    {dialog === "image" && (
      <StudioDialog title={imageTarget === "cover" ? "Add a cover image" : "Add an image"} onClose={closeImage}>
        <form className="studio-dialog-body" onSubmit={e => { e.preventDefault(); void insertImage(); }} aria-busy={imageBusy}>
          <Label>
            Upload an image
            <Input disabled={imageBusy} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/tiff" onChange={e => void loadImage(e.target.files?.[0])} />
            <small>JPG, PNG, WebP, AVIF or TIFF · up to 4 MB</small>
          </Label>
          {imageFile && <p>{imageFile.name} selected</p>}
          <Label>
            Or use an image URL
            <Input disabled={imageBusy} value={url} onChange={e => { setImageFile(null); setUrl(e.target.value); }} placeholder="https://…" />
            <small>Wikimedia Commons, The Met, or images already on this site. For other sources, upload the downloaded file.</small>
          </Label>
          <Label>
            Alt text
            <Input disabled={imageBusy} required maxLength={1000} value={alt} onChange={e => setAlt(e.target.value)} placeholder="Describe what is in the image" />
          </Label>
          <Label>
            Image credit and license
            <Textarea disabled={imageBusy} required maxLength={950} value={credit} onChange={e => setCredit(e.target.value)} placeholder="Artist, work title, source URL, and reuse license; or credit your original photograph" />
          </Label>
          <p>Use images you have permission to publish. Images are compressed automatically, keeping the full composition. Inserted images are stored publicly, even while the post is a draft.</p>
          {dialogError && <p role="alert" className="studio-error">{dialogError}</p>}
          <Button disabled={imageBusy} className="studio-primary" type="submit">{imageBusy ? 'Optimizing image…' : 'Insert image'}</Button>
        </form>
      </StudioDialog>
    )}
    <AlertDialog open={dialog === "unpublish"} onOpenChange={open => { if (!open) setDialog(null); }}>
      <AlertDialogContent className="studio-dialog">
        <div className="studio-dialog-body">
          <AlertDialogTitle className="font-normal">Unpublish this post?</AlertDialogTitle>
          <AlertDialogDescription>“{content.title || "Untitled post"}” will be removed from the blog and returned to draft. You can publish it again at any time.</AlertDialogDescription>
          <AlertDialogAction className="studio-primary" onClick={() => void unpublish()}>Unpublish</AlertDialogAction>
          <AlertDialogCancel variant="ghost" className="studio-text-button ml-5">Cancel</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
