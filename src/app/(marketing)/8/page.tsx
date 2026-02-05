"use client";

import Link from "next/link";

/**
 * DESIGN 8: MARQUEE CHAOS
 *
 * Concept: Continuous scrolling text marquees running in different directions
 * and speeds. Organized chaos of information. Bold, overwhelming, unforgettable.
 * Like Times Square meets a therapy practice. Text as texture.
 *
 * Memorable element: The relentless, hypnotic scrolling text layers
 */

export default function MarqueePage() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F5F0E8] overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between bg-[#1A1A1A]/80 backdrop-blur-sm">
        <Link href="/8" className="text-sm tracking-[0.2em] uppercase">
          Resource Builder
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm opacity-60 hover:opacity-100">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2 bg-[#D4956A] text-[#1A1A1A] hover:bg-[#E8B86D] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      <main>
        {/* Hero with marquee background */}
        <section className="min-h-screen relative flex items-center justify-center">
          {/* Marquee layers */}
          <div className="absolute inset-0 flex flex-col justify-center gap-4 opacity-10 pointer-events-none overflow-hidden">
            {/* Row 1 - Fast, right */}
            <div className="whitespace-nowrap animate-marquee-fast">
              <span className="text-[8vw] font-bold tracking-tighter">
                EMOTION CARDS • THERAPY MATERIALS • AI POWERED • PRINT READY • CONSISTENT STYLE • EMOTION CARDS • THERAPY MATERIALS • AI POWERED • PRINT READY • CONSISTENT STYLE •&nbsp;
              </span>
              <span className="text-[8vw] font-bold tracking-tighter">
                EMOTION CARDS • THERAPY MATERIALS • AI POWERED • PRINT READY • CONSISTENT STYLE • EMOTION CARDS • THERAPY MATERIALS • AI POWERED • PRINT READY • CONSISTENT STYLE •&nbsp;
              </span>
            </div>

            {/* Row 2 - Slow, left */}
            <div className="whitespace-nowrap animate-marquee-slow-reverse">
              <span className="text-[6vw] font-light tracking-tight opacity-50">
                HAPPY SAD CALM WORRIED EXCITED PROUD SCARED BRAVE FRUSTRATED HOPEFUL HAPPY SAD CALM WORRIED EXCITED PROUD SCARED BRAVE FRUSTRATED HOPEFUL&nbsp;
              </span>
              <span className="text-[6vw] font-light tracking-tight opacity-50">
                HAPPY SAD CALM WORRIED EXCITED PROUD SCARED BRAVE FRUSTRATED HOPEFUL HAPPY SAD CALM WORRIED EXCITED PROUD SCARED BRAVE FRUSTRATED HOPEFUL&nbsp;
              </span>
            </div>

            {/* Row 3 - Medium, right */}
            <div className="whitespace-nowrap animate-marquee">
              <span className="text-[10vw] font-bold tracking-tighter">
                CREATE • GENERATE • PRINT • CREATE • GENERATE • PRINT • CREATE • GENERATE • PRINT • CREATE • GENERATE • PRINT •&nbsp;
              </span>
              <span className="text-[10vw] font-bold tracking-tighter">
                CREATE • GENERATE • PRINT • CREATE • GENERATE • PRINT • CREATE • GENERATE • PRINT • CREATE • GENERATE • PRINT •&nbsp;
              </span>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 text-center px-8">
            <h1
              className="text-6xl md:text-9xl font-bold tracking-tighter mb-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Therapy
              <br />
              <span className="text-[#D4956A]">Materials</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-60 max-w-lg mx-auto mb-12">
              Create beautiful emotion cards that resonate.
            </p>
            <Link
              href="/signup"
              className="inline-block px-12 py-5 bg-[#F5F0E8] text-[#1A1A1A] text-lg font-medium hover:bg-[#D4956A] transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Marquee divider - Features */}
        <div className="py-4 bg-[#D4956A] text-[#1A1A1A] overflow-hidden">
          <div className="whitespace-nowrap animate-marquee-fast flex">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-lg font-bold tracking-widest uppercase">
                ★ 5 STYLE PRESETS ★ 20+ EMOTIONS ★ AI ILLUSTRATIONS ★ PDF EXPORT ★ CUT LINES INCLUDED ★ 14 DAYS FREE&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Features section with side marquees */}
        <section className="py-32 px-8 relative">
          {/* Side marquee - vertical */}
          <div className="absolute left-0 top-0 bottom-0 w-16 overflow-hidden opacity-20">
            <div className="animate-marquee-vertical whitespace-nowrap" style={{ writingMode: "vertical-rl" }}>
              <span className="text-xs tracking-[0.5em] uppercase">
                STYLE EMOTION GENERATE PRINT STYLE EMOTION GENERATE PRINT STYLE EMOTION GENERATE PRINT&nbsp;
              </span>
              <span className="text-xs tracking-[0.5em] uppercase">
                STYLE EMOTION GENERATE PRINT STYLE EMOTION GENERATE PRINT STYLE EMOTION GENERATE PRINT&nbsp;
              </span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <span className="text-[#D4956A] text-sm tracking-widest">01</span>
                <h3 className="text-3xl mt-2 mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  Choose Your Style
                </h3>
                <p className="opacity-60">
                  Five curated presets or build your own. Colors, typography,
                  illustration style—all customizable.
                </p>
              </div>

              <div>
                <span className="text-[#D4956A] text-sm tracking-widest">02</span>
                <h3 className="text-3xl mt-2 mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  Select Emotions
                </h3>
                <p className="opacity-60">
                  20+ research-backed feelings. From primary emotions to nuanced
                  states like overwhelmed or hopeful.
                </p>
              </div>

              <div>
                <span className="text-[#D4956A] text-sm tracking-widest">03</span>
                <h3 className="text-3xl mt-2 mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  Generate Cards
                </h3>
                <p className="opacity-60">
                  AI creates matching illustrations that maintain your style
                  across the entire deck.
                </p>
              </div>

              <div>
                <span className="text-[#D4956A] text-sm tracking-widest">04</span>
                <h3 className="text-3xl mt-2 mb-4" style={{ fontFamily: "Georgia, serif" }}>
                  Print & Use
                </h3>
                <p className="opacity-60">
                  Export print-ready PDF with professional cut lines. Physical
                  materials for real sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote marquee */}
        <div className="py-8 border-y border-[#F5F0E8]/10 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee-slow">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-2xl md:text-4xl italic opacity-40" style={{ fontFamily: "Georgia, serif" }}>
                "The consistency is everything" — Maria Rodriguez&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                "My kids actually want to use these" — Dr. Sarah Chen&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                "Professional quality in minutes" — James Thompson&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Stats with marquee */}
        <section className="py-24 relative overflow-hidden">
          {/* Background marquee */}
          <div className="absolute inset-0 flex items-center opacity-5 pointer-events-none">
            <div className="whitespace-nowrap animate-marquee-slow">
              <span className="text-[30vw] font-bold tracking-tighter">
                500+ THERAPISTS 500+ THERAPISTS 500+ THERAPISTS&nbsp;
              </span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl md:text-7xl font-light text-[#D4956A]">500+</p>
                <p className="text-sm tracking-widest uppercase opacity-40 mt-2">Therapists</p>
              </div>
              <div>
                <p className="text-5xl md:text-7xl font-light text-[#D4956A]">20+</p>
                <p className="text-sm tracking-widest uppercase opacity-40 mt-2">Emotions</p>
              </div>
              <div>
                <p className="text-5xl md:text-7xl font-light text-[#D4956A]">5</p>
                <p className="text-sm tracking-widest uppercase opacity-40 mt-2">Presets</p>
              </div>
              <div>
                <p className="text-5xl md:text-7xl font-light text-[#D4956A]">14</p>
                <p className="text-sm tracking-widest uppercase opacity-40 mt-2">Days Free</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-8 bg-[#F5F0E8] text-[#1A1A1A] relative overflow-hidden">
          {/* Background marquees */}
          <div className="absolute top-8 left-0 right-0 opacity-10 overflow-hidden">
            <div className="whitespace-nowrap animate-marquee-fast">
              <span className="text-xl font-bold tracking-widest">
                START CREATING • START CREATING • START CREATING • START CREATING • START CREATING •&nbsp;
              </span>
              <span className="text-xl font-bold tracking-widest">
                START CREATING • START CREATING • START CREATING • START CREATING • START CREATING •&nbsp;
              </span>
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 opacity-10 overflow-hidden">
            <div className="whitespace-nowrap animate-marquee-slow-reverse">
              <span className="text-xl font-bold tracking-widest">
                FREE TRIAL • NO CREDIT CARD • FREE TRIAL • NO CREDIT CARD • FREE TRIAL • NO CREDIT CARD •&nbsp;
              </span>
              <span className="text-xl font-bold tracking-widest">
                FREE TRIAL • NO CREDIT CARD • FREE TRIAL • NO CREDIT CARD • FREE TRIAL • NO CREDIT CARD •&nbsp;
              </span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2
              className="text-5xl md:text-7xl mb-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ready?
            </h2>
            <Link
              href="/signup"
              className="inline-block px-16 py-6 bg-[#1A1A1A] text-[#F5F0E8] text-xl font-medium hover:bg-[#D4956A] transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 flex items-center justify-between text-xs opacity-40">
        <p>© 2025 Resource Builder</p>
        <nav className="flex gap-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-fast {
          animation: marquee 15s linear infinite;
        }
        .animate-marquee-slow {
          animation: marquee 45s linear infinite;
        }
        .animate-marquee-slow-reverse {
          animation: marquee-reverse 45s linear infinite;
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
