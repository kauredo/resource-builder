import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Resource Builder — Therapy Materials Made Beautiful";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #faf8f5 0%, #f5f0eb 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative shapes */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 120,
            width: 180,
            height: 220,
            borderRadius: 24,
            backgroundColor: "rgba(212, 101, 74, 0.08)",
            transform: "rotate(8deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            width: 160,
            height: 200,
            borderRadius: 24,
            backgroundColor: "rgba(107, 144, 128, 0.08)",
            transform: "rotate(-6deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 200,
            width: 120,
            height: 160,
            borderRadius: 24,
            backgroundColor: "rgba(83, 144, 217, 0.06)",
            transform: "rotate(3deg)",
            display: "flex",
          }}
        />

        {/* Floating emotion card hints */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 80,
            width: 80,
            height: 100,
            borderRadius: 16,
            backgroundColor: "#FF6B6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-8deg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.3)",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 90,
            width: 80,
            height: 100,
            borderRadius: 16,
            backgroundColor: "#6B9080",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(5deg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.3)",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 100,
            right: 160,
            width: 70,
            height: 88,
            borderRadius: 14,
            backgroundColor: "#5390D9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-3deg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.3)",
              display: "flex",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 140,
            width: 70,
            height: 88,
            borderRadius: 14,
            backgroundColor: "#C77DFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(6deg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.3)",
              display: "flex",
            }}
          />
        </div>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#d4654a",
              letterSpacing: "0.05em",
              marginBottom: 16,
              display: "flex",
            }}
          >
            FOR THERAPISTS & PSYCHOLOGISTS
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#1a1a1a",
              textAlign: "center",
              lineHeight: 1.15,
              maxWidth: 700,
              display: "flex",
            }}
          >
            Therapy materials your clients will love
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#666",
              marginTop: 20,
              textAlign: "center",
              maxWidth: 560,
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            AI-powered emotion cards, worksheets, and games — designed for print
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
