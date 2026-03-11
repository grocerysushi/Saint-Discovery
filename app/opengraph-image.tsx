import { ImageResponse } from "next/og";

export const alt = "Saint Discovery Catholic saint quiz";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
              fontSize: "28px",
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
              maxWidth: "860px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "74px",
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Which Catholic Saint Are You?
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "32px",
                lineHeight: 1.35,
                color: "rgba(245, 236, 216, 0.82)",
              }}
            >
              Take the quiz, discover your spiritual gifts, and explore a
              searchable directory of saints.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              color: "#F5ECD8",
            }}
          >
            Catholic saint quiz • saint biographies • feast days
          </div>
        </div>
      </div>
    ),
    size
  );
}
