"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/**
 * DESIGN 13: SPLIT SCREEN MORPH
 *
 * Concept: A split-screen design where the two halves react to each other.
 * As you scroll, content morphs and slides between panels. Bold diagonal
 * splits, dramatic typography, and content that "bleeds" across the divide.
 *
 * Memorable element: The diagonal split and cross-boundary interactions
 */

export default function SplitScreenPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0.5);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e: MouseEvent) => setMouseX(e.clientX / window.innerWidth);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouse);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  const splitPosition = 45 + mouseX * 10; // 45-55% based on mouse

  return (
    <div className="min-h-[400vh] relative">
      {/* Fixed split background */}
      <div className="fixed inset-0 flex">
        {/* Left side - Dark */}
        <div
          className="h-full bg-[#1A1A1A] transition-all duration-300 ease-out"
          style={{ width: `${splitPosition}%` }}
        />
        {/* Right side - Light */}
        <div
          className="h-full bg-[#F5F0E8] transition-all duration-300 ease-out"
          style={{ width: `${100 - splitPosition}%` }}
        />
      </div>

      {/* Diagonal line overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `linear-gradient(${105 + scrollY * 0.01}deg, transparent 49.5%, #D4956A 49.5%, #D4956A 50.5%, transparent 50.5%)`,
        }}
      />

      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between mix-blend-difference text-white">
        <Link href="/13" className="text-sm tracking-[0.2em] uppercase">
          Resource Builder
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm opacity-70 hover:opacity-100">
            Login
          </Link>
          <Link href="/signup" className="text-sm border border-current px-4 py-2">
            Start
          </Link>
        </div>
      </header>

      {/* Content sections */}
      <main className="relative z-20">
        {/* Section 1: Hero */}
        <section className="h-screen flex items-center relative">
          <div className="w-full px-8 grid grid-cols-2 gap-8">
            {/* Left content (on dark) */}
            <div className="text-[#F5F0E8] pr-8">
              <p className="text-sm tracking-[0.3em] uppercase opacity-50 mb-6">
                For Therapists
              </p>
              <h1
                className="text-5xl md:text-7xl leading-[0.9]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Create
                <br />
                with
                <br />
                <em className="text-[#D4956A]">purpose.</em>
              </h1>
            </div>
            {/* Right content (on light) */}
            <div className="text-[#1A1A1A] pl-8 flex flex-col justify-center">
              <p className="text-lg leading-relaxed opacity-70">
                Emotion cards and therapy materials that match the care you put
                into your practice.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium"
              >
                <span>Start free trial</span>
                <span className="w-8 h-px bg-current" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Features */}
        <section className="min-h-screen flex items-center py-24">
          <div className="w-full px-8">
            {/* Feature that bleeds across */}
            <div className="relative">
              <div
                className="text-[20vw] font-bold leading-none tracking-tighter opacity-5 absolute -top-16 left-0 text-[#F5F0E8] mix-blend-difference"
                style={{ fontFamily: "Georgia, serif" }}
              >
                STYLE
              </div>
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="text-[#F5F0E8]">
                  <span className="text-xs tracking-widest opacity-50">01</span>
                  <h2
                    className="text-4xl mt-4 mb-6"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Your visual
                    <br />
                    language
                  </h2>
                </div>
                <div className="text-[#1A1A1A] flex items-center">
                  <p className="text-lg opacity-70">
                    Choose from curated presets or craft your own. Colors,
                    typography, illustration style—all customizable.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative mt-48">
              <div
                className="text-[20vw] font-bold leading-none tracking-tighter opacity-5 absolute -top-16 right-0 text-[#1A1A1A] mix-blend-difference"
                style={{ fontFamily: "Georgia, serif" }}
              >
                FEEL
              </div>
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="text-[#F5F0E8]">
                  <span className="text-xs tracking-widest opacity-50">02</span>
                  <h2
                    className="text-4xl mt-4 mb-6"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    20+ emotions
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["Happy", "Sad", "Calm", "Worried", "Proud"].map((e) => (
                      <span
                        key={e}
                        className="text-xs px-3 py-1.5 border border-current opacity-60"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-[#1A1A1A] flex items-center">
                  <p className="text-lg opacity-70">
                    From primary feelings to nuanced states. Research-backed
                    categories your clients will recognize.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative mt-48">
              <div
                className="text-[20vw] font-bold leading-none tracking-tighter opacity-5 absolute -top-16 left-0 text-[#F5F0E8] mix-blend-difference"
                style={{ fontFamily: "Georgia, serif" }}
              >
                MAKE
              </div>
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="text-[#F5F0E8]">
                  <span className="text-xs tracking-widest opacity-50">03</span>
                  <h2
                    className="text-4xl mt-4 mb-6"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    AI generates,
                    <br />
                    you print
                  </h2>
                </div>
                <div className="text-[#1A1A1A] flex items-center">
                  <p className="text-lg opacity-70">
                    Cohesive illustrations for every card. Export print-ready
                    PDFs with cut lines. Physical materials for real sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Testimonial */}
        <section className="min-h-screen flex items-center py-24">
          <div className="w-full px-8 grid grid-cols-2 gap-8">
            <div className="text-[#F5F0E8] flex items-center">
              <blockquote
                className="text-3xl md:text-4xl leading-snug"
                style={{ fontFamily: "Georgia, serif" }}
              >
                "The consistency is everything. Same character, same style,
                building trust."
              </blockquote>
            </div>
            <div className="text-[#1A1A1A] flex flex-col justify-center">
              <div className="w-20 h-20 rounded-full bg-[#D4956A] mb-6" />
              <p className="font-medium">Maria Rodriguez</p>
              <p className="text-sm opacity-50">Play Therapist</p>
            </div>
          </div>
        </section>

        {/* Section 4: CTA */}
        <section className="h-screen flex items-center justify-center">
          <div className="text-center relative z-10">
            <h2
              className="text-5xl md:text-7xl mb-8 mix-blend-difference text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ready to
              <br />
              <em>begin?</em>
            </h2>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-[#D4956A] text-white hover:bg-[#C4855A] transition-colors"
            >
              Start free trial
            </Link>
            <p className="mt-6 text-sm mix-blend-difference text-white opacity-50">
              14 days free · No credit card
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-8 py-4 flex items-center justify-between mix-blend-difference text-white text-xs">
        <p>© 2025</p>
        <nav className="flex gap-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
