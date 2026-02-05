import Link from "next/link";

/**
 * DESIGN 4: RETRO PLAYFUL (70s-inspired)
 *
 * Aesthetic: Warm, nostalgic, groovy. Inspired by 1970s design with rounded
 * shapes, warm earth tones, playful typography, and vintage textures.
 * Feels approachable, fun, and slightly nostalgic without being childish.
 *
 * Memorable element: The retro color palette and curved, flowing shapes
 */

export default function RetroPage() {
  return (
    <div
      className="min-h-screen text-[#3D2314]"
      style={{
        background:
          "linear-gradient(180deg, #FFF5E6 0%, #FFE4C4 50%, #FFDAB9 100%)",
      }}
    >
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#E07B39] focus:text-white focus:px-4 focus:py-2 focus:rounded-full"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 py-6">
          <div
            className="rounded-full px-8 py-4 flex items-center justify-between"
            style={{
              background: "rgba(255, 245, 230, 0.9)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 30px rgba(139, 69, 19, 0.1)",
            }}
          >
            <Link
              href="/4"
              className="text-2xl font-bold"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <span className="text-[#E07B39]">✦</span> Resource Builder
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full hover:bg-[#3D2314]/5 transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-full bg-[#E07B39] text-white font-medium hover:bg-[#C66A2E] transition-colors"
              >
                Get groovy
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-40 pb-20 px-6 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-[#E07B39]/20 blur-3xl" />
          <div className="absolute bottom-0 right-[15%] w-80 h-80 rounded-full bg-[#8B6914]/10 blur-3xl" />

          <div className="max-w-5xl mx-auto text-center relative">
            {/* Retro badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#E07B39]/10 text-[#E07B39] font-medium text-sm mb-8">
              <span>✦</span>
              <span>For groovy therapists</span>
              <span>✦</span>
            </div>

            <h1
              className="text-[clamp(3rem,8vw,6rem)] leading-[1] mb-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Make therapy
              <br />
              <span
                className="inline-block mt-2 px-6 py-2 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #E07B39 0%, #C66A2E 100%)",
                }}
              >
                materials
              </span>
              <br />
              that spark joy
            </h1>

            <p className="text-xl text-[#3D2314]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create beautiful emotion cards, worksheets, and visual tools for
              kids. Warm vibes, consistent style, print-ready goodness.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-10 py-5 rounded-full text-lg font-medium text-white transition-transform hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #E07B39 0%, #C66A2E 100%)",
                  boxShadow: "0 8px 30px rgba(224, 123, 57, 0.4)",
                }}
              >
                Start your free trial ✦
              </Link>
              <Link
                href="#features"
                className="px-10 py-5 rounded-full text-lg font-medium border-2 border-[#3D2314]/20 hover:border-[#3D2314]/40 transition-colors"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-6 text-sm text-[#3D2314]/50">
              14 days free • No credit card • Good vibes only
            </p>
          </div>
        </section>

        {/* Floating cards section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-[350px] flex items-center justify-center">
              {/* Wavy background */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 350"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,175 C200,100 400,250 800,175 L800,350 L0,350 Z"
                  fill="#E07B39"
                  opacity="0.1"
                />
                <path
                  d="M0,200 C200,150 400,275 800,200 L800,350 L0,350 Z"
                  fill="#8B6914"
                  opacity="0.08"
                />
              </svg>

              {/* Cards */}
              <div className="relative flex items-center gap-4">
                <div
                  className="w-32 h-44 rounded-3xl shadow-xl flex flex-col items-center justify-center p-4"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFD166 0%, #EFB93F 100%)",
                    transform: "rotate(-10deg) translateY(20px)",
                  }}
                >
                  <span className="text-4xl mb-2">😊</span>
                  <span className="font-bold text-[#3D2314]">Happy</span>
                </div>

                <div
                  className="w-40 h-52 rounded-3xl shadow-xl flex flex-col items-center justify-center p-4 z-10"
                  style={{
                    background:
                      "linear-gradient(180deg, #06D6A0 0%, #05B384 100%)",
                  }}
                >
                  <span className="text-5xl mb-3">😌</span>
                  <span className="font-bold text-white text-lg">Calm</span>
                </div>

                <div
                  className="w-32 h-44 rounded-3xl shadow-xl flex flex-col items-center justify-center p-4"
                  style={{
                    background:
                      "linear-gradient(180deg, #EF476F 0%, #D63E5C 100%)",
                    transform: "rotate(8deg) translateY(15px)",
                  }}
                >
                  <span className="text-4xl mb-2">😢</span>
                  <span className="font-bold text-white">Sad</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#E07B39] font-medium">✦ The process ✦</span>
              <h2
                className="text-4xl md:text-5xl mt-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Simple as 1-2-3, baby
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div
                className="rounded-[2rem] p-8 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, #FFD166 0%, #EFB93F 100%)",
                }}
              >
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-6">
                  <span
                    className="text-4xl font-bold text-[#3D2314]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    1
                  </span>
                </div>
                <h3
                  className="text-2xl font-bold text-[#3D2314] mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Pick your vibe
                </h3>
                <p className="text-[#3D2314]/80">
                  Choose from groovy presets or create your own far-out style.
                </p>
              </div>

              {/* Step 2 */}
              <div
                className="rounded-[2rem] p-8 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, #06D6A0 0%, #05B384 100%)",
                }}
              >
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-6">
                  <span
                    className="text-4xl font-bold text-white"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    2
                  </span>
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Select feelings
                </h3>
                <p className="text-white/90">
                  20+ emotions from simple feels to complex vibes like
                  "overwhelmed."
                </p>
              </div>

              {/* Step 3 */}
              <div
                className="rounded-[2rem] p-8 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, #E07B39 0%, #C66A2E 100%)",
                }}
              >
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-6">
                  <span
                    className="text-4xl font-bold text-white"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    3
                  </span>
                </div>
                <h3
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Print & play
                </h3>
                <p className="text-white/90">
                  AI makes matching art. Export PDF. Cut, shuffle, and vibe with
                  your clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div
              className="rounded-[3rem] p-12 md:p-16"
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="text-[#E07B39] font-medium">
                    ✦ Why we're different ✦
                  </span>
                  <h2
                    className="text-4xl mt-4 mb-8"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Built for how therapy really works
                  </h2>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFD166, #EFB93F)",
                        }}
                      >
                        <span className="text-xl">🎨</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Same character everywhere
                        </h3>
                        <p className="text-[#3D2314]/70">
                          Your friendly character shows up across all materials.
                          Kids feel the familiarity.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #06D6A0, #05B384)",
                        }}
                      >
                        <span className="text-xl">🖨️</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Print-first design
                        </h3>
                        <p className="text-[#3D2314]/70">
                          Colors optimized for paper, not pixels. Therapy
                          happens offline.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #E07B39, #C66A2E)",
                        }}
                      >
                        <span className="text-xl">💕</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Your brand, your vibe
                        </h3>
                        <p className="text-[#3D2314]/70">
                          Consistent visual style. Parents recognize your
                          materials instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="relative">
                  <div
                    className="aspect-square rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #E07B39 0%, #FFD166 50%, #06D6A0 100%)",
                    }}
                  >
                    <div
                      className="w-[85%] h-[85%] rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.3)" }}
                    >
                      <div
                        className="w-[75%] h-[75%] rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.5)" }}
                      >
                        <span
                          className="text-6xl"
                          role="img"
                          aria-label="peace sign"
                        >
                          ✌️
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8"
              style={{
                background: "linear-gradient(135deg, #E07B39, #C66A2E)",
              }}
            >
              <span className="text-white text-2xl font-bold">SC</span>
            </div>
            <blockquote
              className="text-2xl md:text-3xl leading-relaxed mb-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "Finally, emotion cards that don't look like they're from 2005. My
              kids actually dig using these—and so do I."
            </blockquote>
            <p className="text-[#E07B39] font-medium">Dr. Sarah Chen</p>
            <p className="text-sm text-[#3D2314]/50">Child Psychologist</p>
          </div>
        </section>

        {/* Style presets */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[#E07B39] font-medium">✦ Presets ✦</span>
              <h2
                className="text-4xl mt-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Start with a vibe
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                {
                  name: "Warm & Playful",
                  colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
                },
                {
                  name: "Calm & Minimal",
                  colors: ["#6B9080", "#A4C3B2", "#CCE3DE"],
                },
                {
                  name: "Bold & Colorful",
                  colors: ["#7400B8", "#5390D9", "#56CFE1"],
                },
                {
                  name: "Nature & Earthy",
                  colors: ["#606C38", "#DDA15E", "#FEFAE0"],
                },
                {
                  name: "Whimsical Fantasy",
                  colors: ["#E0AAFF", "#C77DFF", "#9D4EDD"],
                },
              ].map(preset => (
                <div
                  key={preset.name}
                  className="flex items-center gap-3 px-5 py-3 rounded-full bg-white shadow-sm"
                >
                  <div className="flex -space-x-1">
                    {preset.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-white"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-sm">{preset.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-[3rem] p-12 text-center text-white"
              style={{
                background: "linear-gradient(135deg, #E07B39 0%, #C66A2E 100%)",
              }}
            >
              <h2
                className="text-4xl md:text-5xl mb-6"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Ready to get groovy?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Join 500+ therapists making far-out materials for their clients.
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-5 rounded-full bg-white text-[#E07B39] text-lg font-bold hover:scale-105 transition-transform"
              >
                Start free trial ✦
              </Link>
              <p className="mt-6 text-sm opacity-70">
                14 days free • No credit card required
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#3D2314]/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p style={{ fontFamily: "Georgia, serif" }}>
            <span className="text-[#E07B39]">✦</span> Resource Builder © 2025
          </p>
          <nav aria-label="Footer">
            <ul className="flex gap-6 text-sm text-[#3D2314]/50">
              <li>
                <Link href="/privacy" className="hover:text-[#E07B39]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#E07B39]">
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@resourcebuilder.app"
                  className="hover:text-[#E07B39]"
                >
                  Say hello
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
