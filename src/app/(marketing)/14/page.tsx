"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/**
 * DESIGN 14: KINETIC TYPOGRAPHY
 *
 * Concept: Typography as the hero. Massive, animated text that reacts to
 * scroll and hover. Words that fragment, reassemble, and dance. Minimal
 * color, maximum typographic impact. The words ARE the design.
 *
 * Memorable element: The animated, reactive typography throughout
 */

export default function KineticTypePage() {
  const [scrollY, setScrollY] = useState(0);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-[500vh] bg-[#FFFDF8] text-[#1A1A1A] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <Link href="/14" className="text-sm tracking-[0.3em] uppercase">
          RB
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm hover:line-through transition-all"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FFFDF8] transition-colors"
          >
            Begin
          </Link>
        </div>
      </header>

      <main>
        {/* Hero: Giant fragmented typography */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden">
          <h1 className="text-[20vw] md:text-[15vw] font-bold leading-[0.8] tracking-tighter text-center">
            {"THERAPY".split("").map((letter, i) => (
              <span
                key={i}
                className="inline-block transition-all duration-500 hover:text-[#D4956A] cursor-default"
                style={{
                  transform: `translateY(${Math.sin((scrollY * 0.01) + i * 0.5) * 10}px) rotate(${Math.sin((scrollY * 0.005) + i) * 2}deg)`,
                  transitionDelay: `${i * 30}ms`,
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest uppercase opacity-40">Scroll</span>
            <div className="w-px h-12 bg-[#1A1A1A]/20 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-full bg-[#1A1A1A]"
                style={{
                  height: "30%",
                  animation: "scrollDown 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Words that reveal on scroll */}
        <section className="min-h-screen flex items-center py-32 px-8">
          <div className="max-w-6xl mx-auto w-full">
            <p
              className="text-4xl md:text-6xl leading-[1.3] font-light"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {"Create materials that ".split(" ").map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-[0.3em] transition-all duration-700"
                  style={{
                    opacity: scrollY > 400 + i * 50 ? 1 : 0.1,
                    transform: `translateY(${scrollY > 400 + i * 50 ? 0 : 20}px)`,
                  }}
                >
                  {word}
                </span>
              ))}
              <span
                className="inline-block transition-all duration-700"
                style={{
                  opacity: scrollY > 700 ? 1 : 0.1,
                  color: scrollY > 700 ? "#D4956A" : "inherit",
                  transform: `translateY(${scrollY > 700 ? 0 : 20}px) scale(${scrollY > 700 ? 1.1 : 1})`,
                }}
              >
                resonate.
              </span>
            </p>
          </div>
        </section>

        {/* Section 3: Stacked words */}
        <section className="min-h-screen flex items-center py-32 relative">
          <div className="w-full">
            {["STYLE", "EMOTION", "GENERATE", "PRINT"].map((word, i) => (
              <div
                key={word}
                className="relative overflow-hidden group cursor-pointer"
                onMouseEnter={() => setHoveredWord(word)}
                onMouseLeave={() => setHoveredWord(null)}
              >
                <div
                  className={`text-[15vw] md:text-[12vw] font-bold leading-[0.9] tracking-tighter px-8 transition-all duration-500 ${
                    hoveredWord === word
                      ? "text-[#D4956A] translate-x-8"
                      : hoveredWord
                      ? "opacity-20"
                      : ""
                  }`}
                  style={{
                    transform: `translateX(${(scrollY - 1200) * 0.1 * (i % 2 === 0 ? 1 : -1)}px)`,
                  }}
                >
                  {word}
                </div>
                {/* Description that appears on hover */}
                <div
                  className={`absolute right-8 top-1/2 -translate-y-1/2 text-right max-w-xs transition-all duration-500 ${
                    hoveredWord === word
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8"
                  }`}
                >
                  <p className="text-sm opacity-60">
                    {word === "STYLE" && "Define your visual language with curated presets"}
                    {word === "EMOTION" && "20+ research-backed feelings to choose from"}
                    {word === "GENERATE" && "AI creates cohesive illustrations instantly"}
                    {word === "PRINT" && "Export PDF with cut lines, ready for sessions"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Quote with animated emphasis */}
        <section className="min-h-screen flex items-center py-32 px-8">
          <div className="max-w-5xl mx-auto">
            <blockquote className="text-3xl md:text-5xl leading-[1.4] font-light">
              <span style={{ fontFamily: "Georgia, serif" }}>"The </span>
              <span
                className="inline-block font-bold transition-all duration-300 hover:tracking-widest cursor-default"
                onMouseEnter={() => setHoveredWord("consistency")}
                onMouseLeave={() => setHoveredWord(null)}
              >
                consistency
              </span>
              <span style={{ fontFamily: "Georgia, serif" }}> is everything. </span>
              <span
                className="inline-block font-bold transition-all duration-300 hover:text-[#D4956A] cursor-default"
              >
                Same character
              </span>
              <span style={{ fontFamily: "Georgia, serif" }}>, same style, </span>
              <span
                className="inline-block font-bold transition-all duration-300 hover:scale-110 cursor-default"
              >
                building trust
              </span>
              <span style={{ fontFamily: "Georgia, serif" }}> with every session."</span>
            </blockquote>
            <p className="mt-12 text-sm opacity-40">
              — Maria Rodriguez, Play Therapist
            </p>
          </div>
        </section>

        {/* Section 5: Final CTA with expanding text */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="text-center">
            <h2
              className="text-6xl md:text-8xl font-bold tracking-tighter mb-12"
              style={{
                transform: `scale(${1 + Math.max(0, (scrollY - 3000) * 0.0003)})`,
              }}
            >
              {"START".split("").map((letter, i) => (
                <span
                  key={i}
                  className="inline-block hover:text-[#D4956A] transition-colors cursor-default"
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  {letter}
                </span>
              ))}
            </h2>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-4 text-xl"
            >
              <span className="border-b-2 border-transparent group-hover:border-[#1A1A1A] transition-all pb-1">
                Begin free trial
              </span>
              <span className="text-2xl group-hover:translate-x-2 transition-transform">
                →
              </span>
            </Link>
            <p className="mt-8 text-sm opacity-40">14 days free</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 flex items-center justify-between text-xs opacity-40">
        <p>© 2025 Resource Builder</p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="hover:opacity-100">Privacy</Link>
          <Link href="/terms" className="hover:opacity-100">Terms</Link>
        </nav>
      </footer>

      <style jsx>{`
        @keyframes scrollDown {
          0% { top: -30%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
