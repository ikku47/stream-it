import { ImageResponse } from "next/og";

type SectionOgProps = {
  title: string;
  subtitle: string;
  accent: string;
  highlight: string;
};

export function buildSectionOgImage({
  title,
  subtitle,
  accent,
  highlight,
}: SectionOgProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          background:
            "radial-gradient(circle at top left, rgba(249,115,22,0.32), transparent 32%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.12), transparent 18%), linear-gradient(135deg, #090810 0%, #111320 45%, #07060c 100%)",
          color: "white",
          padding: "56px",
          overflow: "hidden",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.02))",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.02))",
            opacity: 0.35,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -60,
            bottom: -60,
            width: 360,
            height: 360,
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.38) 0%, rgba(249,115,22,0.08) 50%, transparent 72%)",
            filter: "blur(8px)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 18, zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 10,
              padding: "12px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Stream It
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 14,
                height: 120,
                borderRadius: 999,
                background: accent,
                boxShadow: `0 0 40px ${accent}66`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 84,
                  lineHeight: 0.92,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  maxWidth: 980,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.35,
                  maxWidth: 900,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {subtitle}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              maxWidth: 880,
            }}
          >
            {["Movies", "TV Shows", "Live TV", "Radio"].map((chip) => (
              <div
                key={chip}
                style={{
                  padding: "12px 18px",
                  borderRadius: 999,
                  background:
                    chip === highlight ? accent : "rgba(255,255,255,0.06)",
                  color: chip === highlight ? "#fff" : "rgba(255,255,255,0.78)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {chip}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 22, color: "rgba(255,255,255,0.50)" }}>
              Discover with rich artwork, metadata, and fast search
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {highlight}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
