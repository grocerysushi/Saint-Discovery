import { ImageResponse } from "next/og";
import { getSaintBySlug } from "@/lib/saints";
import { saintDisplayName } from "@/lib/saint-seo";

export const alt = "Saint biography and sources on Saint Discovery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function SaintImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const saint = await getSaintBySlug(slug);
  if (!saint) return new Response("Not found", { status: 404 });
  const name = saintDisplayName(saint);

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 76px", background: "#111e24", color: "#f5f3eb", borderLeft: "16px solid #b7c99d" }}>
      <div style={{ display: "flex", fontSize: 25, letterSpacing: "0.14em", color: "#b7c99d" }}>SAINT DISCOVERY</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: name.length > 38 ? 54 : 72, lineHeight: 1.1, fontWeight: 700 }}>{name}</div>
        {saint.feast_day && <div style={{ display: "flex", fontSize: 32, color: "#b7c99d" }}>Feast day: {saint.feast_day}</div>}
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#c2ced0" }}>Discover the story{saint.prayer ? " · Find a prayer" : ""} · Explore the directory</div>
    </div>,
    size,
  );
}
