type SiteIconProps = {
  size: number;
};

export default function SiteIcon({ size }: SiteIconProps) {
  const inset = Math.round(size * 0.1);
  const medallionSize = size - inset * 2;
  const crossThickness = Math.max(8, Math.round(size * 0.1));
  const crossHeight = Math.round(medallionSize * 0.44);
  const crossWidth = Math.round(medallionSize * 0.38);
  const starSize = Math.round(size * 0.2);
  const ribbonWidth = Math.round(size * 0.22);
  const ribbonHeight = Math.round(size * 0.3);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        borderRadius: Math.round(size * 0.24),
        background: "linear-gradient(160deg, #0F1C2F 0%, #1E3555 52%, #2A4B73 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          height: medallionSize,
          width: medallionSize,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: Math.round(medallionSize * 0.28),
          background:
            "radial-gradient(circle at 30% 25%, #FFF3D7 0%, #E7C98C 38%, #B98B42 100%)",
          boxShadow: "inset 0 0 0 2px rgba(255, 248, 235, 0.34)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: Math.round(size * 0.12),
            right: Math.round(size * 0.1),
            height: starSize,
            width: starSize,
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(45deg)",
          }}
        >
          <div
            style={{
              display: "flex",
              position: "absolute",
              height: starSize,
              width: Math.max(4, Math.round(starSize * 0.28)),
              borderRadius: 999,
              background: "#FFF8EB",
              boxShadow: "0 2px 8px rgba(15, 28, 47, 0.2)",
            }}
          />
          <div
            style={{
              display: "flex",
              position: "absolute",
              height: Math.max(4, Math.round(starSize * 0.28)),
              width: starSize,
              borderRadius: 999,
              background: "#FFF8EB",
              boxShadow: "0 2px 8px rgba(15, 28, 47, 0.2)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            height: crossHeight,
            width: crossThickness,
            borderRadius: 999,
            background: "#FFF8EB",
            boxShadow: "0 2px 10px rgba(15, 28, 47, 0.18)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            height: crossThickness,
            width: crossWidth,
            borderRadius: 999,
            background: "#FFF8EB",
            boxShadow: "0 2px 10px rgba(15, 28, 47, 0.18)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -1,
            right: -1,
            width: ribbonWidth,
            height: ribbonHeight,
            clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
            background: "linear-gradient(180deg, #7D1325 0%, #58101C 100%)",
            boxShadow: "inset 0 0 0 2px rgba(255, 244, 220, 0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              color: "#F8E9C7",
              fontSize: Math.round(ribbonWidth * 0.34),
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            SD
          </div>
        </div>
      </div>
    </div>
  );
}
