import { ImageResponse } from "next/og";
import { getSaintBySlug } from "@/lib/saints";

export const revalidate = 86400;

export const alt = "Catholic saint biography on Saint Discovery";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const saint = await getSaintBySlug(slug).catch(() => null);

  const name = saint ? `St. ${saint.name}` : "Catholic Saint";
  const tagline = saint?.tagline ?? "Biography, feast day, and prayer";
  const feastDay = saint?.feast_day ? `Feast Day: ${saint.feast_day}` : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, #081527 0%, #102748 50%, #17345F 100%)",
          color: "#F5ECD8",
          padding: "64px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            border: "2px solid rgba(212, 175, 55, 0.45)",
            borderRadius: "32px",
            padding: "48px",
            background: "rgba(6, 17, 34, 0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#D4AF37",
            }}
          >
            Saint Discovery
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              maxWidth: "980px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: name.length > 26 ? "58px" : "74px",
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "30px",
                lineHeight: 1.35,
                fontStyle: "italic",
                color: "rgba(245, 236, 216, 0.82)",
              }}
            >
              {tagline.length > 120 ? `${tagline.slice(0, 117)}...` : tagline}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "24px",
              color: "#F5ECD8",
            }}
          >
            <div style={{ display: "flex" }}>
              {feastDay ?? "Biography • Feast Day • Prayer"}
            </div>
            <div style={{ display: "flex", color: "#D4AF37" }}>
              Which Catholic saint are you?
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
