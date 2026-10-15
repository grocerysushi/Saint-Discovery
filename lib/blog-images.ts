// Match the journal's one/two/three-column grid and 1,000px article cover.
export const BLOG_IMAGE_SIZES = {
  card: "(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 80px) / 2), (max-width: 1050px) calc((100vw - 120px) / 2), (max-width: 1296px) calc((100vw - 144px) / 3), 384px",
  feature: "(max-width: 600px) calc(100vw - 40px), (max-width: 800px) calc(100vw - 56px), (max-width: 1000px) calc((100vw - 56px) / 2.05), (max-width: 1296px) calc((100vw - 96px) / 2.05), 585px",
  cover: "(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 56px), (max-width: 1096px) calc(100vw - 96px), 1000px",
};

// Sacred art can place faces, gestures, and identifying objects at opposite
// edges. Preserve the whole composition in every frame, including new posts.
export const BLOG_IMAGE_STYLE = { objectFit: "contain", objectPosition: "50% 50%" } as const;

// Keep this allowlist aligned with next.config.ts. Other editor-approved URLs
// and data uploads still render directly, without opening an arbitrary proxy.
export function canOptimizeBlogImage(src: string): boolean {
  if (/^\/(?!\/)/.test(src)) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" || url.port || url.username || url.password) return false;
    return (url.hostname === "upload.wikimedia.org" && url.pathname.startsWith("/wikipedia/commons/"))
      || (url.hostname === "thumb.wikimedia.org" && url.pathname.startsWith("/wikipedia/commons/thumb/"));
  } catch { return false; }
}
