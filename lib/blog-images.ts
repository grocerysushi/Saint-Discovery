// Match the journal's one/two/three-column grid and 1,000px article cover.
export const BLOG_IMAGE_SIZES = {
  card: "(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 80px) / 2), (max-width: 1050px) calc((100vw - 120px) / 2), (max-width: 1296px) calc((100vw - 144px) / 3), 384px",
  feature: "(max-width: 600px) calc(100vw - 40px), (max-width: 800px) calc(100vw - 56px), (max-width: 1000px) calc((100vw - 56px) / 2.05), (max-width: 1296px) calc((100vw - 96px) / 2.05), 585px",
  cover: "(max-width: 600px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 56px), (max-width: 1096px) calc(100vw - 96px), 1000px",
};

// These tall portraits need a higher focal point in the landscape cover frame.
// Key by the licensed source rather than a post slug so reused artwork agrees.
const BLOG_IMAGE_POSITIONS: Record<string, string> = {
  "https://upload.wikimedia.org/wikipedia/commons/f/fb/Christ_Icon_Sinai_6th_century.jpg": "50% 20%",
  "https://upload.wikimedia.org/wikipedia/commons/0/07/El_Greco_-_Tears_of_St._Peter_-_NG.M.01346_-_National_Museum_of_Art%2C_Architecture_and_Design.jpg": "50% 20%",
};

export function blogImagePosition(src: string): string {
  return BLOG_IMAGE_POSITIONS[src] ?? "50% 50%";
}

// This portrait's face and heart span more height than a landscape crop can
// retain. Apply to the source so every card, cover, and reused post agrees.
export function blogImageFit(src: string): "contain" | "cover" {
  return src === "https://upload.wikimedia.org/wikipedia/commons/4/4f/SacredHeartBatoni.jpg"
    ? "contain"
    : "cover";
}

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
