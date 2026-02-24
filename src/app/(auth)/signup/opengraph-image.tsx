import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Create your Resource Builder account — 14-day free trial";
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
          flexDirection: "row",
          background: "linear-gradient(160deg, #faf8f5 0%, #f3ede6 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle texture — large faded circle in top-right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: 250,
            backgroundColor: "rgba(212, 101, 74, 0.04)",
            display: "flex",
          }}
        />

        {/* Left column — typography */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 80,
            paddingRight: 40,
            width: 680,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 32,
                height: 3,
                backgroundColor: "#d4654a",
                marginRight: 12,
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#d4654a",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                display: "flex",
              }}
            >
              Resource Builder
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#1c1917",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              marginBottom: 20,
              display: "flex",
            }}
          >
            Create therapy materials your clients will love
          </div>

          {/* Subline */}
          <div
            style={{
              fontSize: 20,
              color: "#78716c",
              lineHeight: 1.5,
              marginBottom: 36,
              maxWidth: 480,
              display: "flex",
            }}
          >
            Emotion cards, worksheets, games, and more — AI-powered, designed
            for print.
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                backgroundColor: "#d4654a",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: 10,
                display: "flex",
              }}
            >
              Start your free trial
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#a8a29e",
                display: "flex",
              }}
            >
              14 days — no credit card
            </div>
          </div>
        </div>

        {/* Right column — stacked resource previews */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 16,
            width: 520,
            paddingRight: 60,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Emotion card preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              backgroundColor: "#fff",
              paddingLeft: 16,
              paddingRight: 24,
              paddingTop: 16,
              paddingBottom: 16,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transform: "translateX(20px)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 64,
                borderRadius: 10,
                backgroundColor: "#d4654a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.35)",
                  display: "flex",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1c1917",
                  display: "flex",
                }}
              >
                Emotion Cards
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#a8a29e",
                  display: "flex",
                }}
              >
                Happy, Sad, Angry, Calm...
              </div>
            </div>
          </div>

          {/* Worksheet preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              backgroundColor: "#fff",
              paddingLeft: 16,
              paddingRight: 24,
              paddingTop: 16,
              paddingBottom: 16,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transform: "translateX(48px)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 64,
                borderRadius: 10,
                backgroundColor: "#6b9080",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {/* Lined paper hint */}
              <div
                style={{
                  width: 28,
                  height: 2,
                  backgroundColor: "rgba(255,255,255,0.35)",
                  display: "flex",
                }}
              />
              <div
                style={{
                  width: 28,
                  height: 2,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  display: "flex",
                }}
              />
              <div
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1c1917",
                  display: "flex",
                }}
              >
                Worksheets
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#a8a29e",
                  display: "flex",
                }}
              >
                Fill-in, prompts, activities
              </div>
            </div>
          </div>

          {/* Board game preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              backgroundColor: "#fff",
              paddingLeft: 16,
              paddingRight: 24,
              paddingTop: 16,
              paddingBottom: 16,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transform: "translateX(12px)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 64,
                borderRadius: 10,
                backgroundColor: "#c4915e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Dice-like dots */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  width: 26,
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.4)",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.35)",
                    display: "flex",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1c1917",
                  display: "flex",
                }}
              >
                Board Games
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#a8a29e",
                  display: "flex",
                }}
              >
                Custom boards, cards, pieces
              </div>
            </div>
          </div>

          {/* Flashcards preview */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              backgroundColor: "#fff",
              paddingLeft: 16,
              paddingRight: 24,
              paddingTop: 16,
              paddingBottom: 16,
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              transform: "translateX(36px)",
            }}
          >
            <div
              style={{
                width: 52,
                height: 64,
                borderRadius: 10,
                backgroundColor: "#5390D9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                }}
              >
                Aa
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1c1917",
                  display: "flex",
                }}
              >
                Flashcards
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#a8a29e",
                  display: "flex",
                }}
              >
                Front & back, print-ready
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #d4654a 0%, #6b9080 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
