import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WoHoTech — Learn, Create, Grow";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: "bold",
            color: "white",
            marginBottom: 24,
            letterSpacing: "-2px",
          }}
        >
          WoHoTech
        </div>
        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 16,
          }}
        >
          Learn. Create. Grow.
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.65)",
            marginTop: 12,
          }}
        >
          Coding tutorials, AI tools & placement prep for engineering students
        </div>
      </div>
    ),
    { ...size }
  );
}
