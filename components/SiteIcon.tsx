type SiteIconProps = {
  size: number;
};

export default function SiteIcon({ size }: SiteIconProps) {
  const ringSize = Math.round(size * 0.72);
  const barThickness = Math.max(8, Math.round(size * 0.12));
  const verticalHeight = Math.round(size * 0.52);
  const horizontalWidth = Math.round(size * 0.52);
  const haloSize = Math.round(size * 0.2);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: Math.round(size * 0.22),
        background: "linear-gradient(160deg, #1A1A2E 0%, #242445 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "relative",
          height: ringSize,
          width: ringSize,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          border: `${Math.max(6, Math.round(size * 0.08))}px solid #D4A574`,
          boxShadow: "0 0 0 6px rgba(245, 240, 232, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            height: verticalHeight,
            width: barThickness,
            borderRadius: 999,
            background: "#F5F0E8",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            height: barThickness,
            width: horizontalWidth,
            borderRadius: 999,
            background: "#F5F0E8",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            height: haloSize,
            width: haloSize,
            borderRadius: 999,
            background: "#D4A574",
          }}
        />
      </div>
    </div>
  );
}
