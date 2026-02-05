"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

/**
 * DESIGN 11: HORIZONTAL SCROLL JOURNEY
 *
 * Concept: The entire page scrolls horizontally like a storybook or film strip.
 * Each "panel" is a full viewport section. Scroll indicator shows progress.
 * Mouse wheel triggers horizontal movement. Dramatic, cinematic, memorable.
 *
 * Memorable element: The unexpected horizontal scroll paradigm
 */

export default function HorizontalScrollPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 2;
    };

    const handleScroll = () => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = container.scrollLeft / maxScroll;
      setScrollProgress(progress);
      setCurrentPanel(Math.round(progress * 4));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-[#0A0A0A] text-[#F5F5F0]">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between mix-blend-difference">
        <Link href="/11" className="text-sm tracking-[0.3em] uppercase">
          Resource Builder
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm border border-current px-4 py-2 hover:bg-[#F5F5F0] hover:text-[#0A0A0A] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Progress bar */}
      <div className="fixed bottom-8 left-8 right-8 z-50 h-px bg-[#F5F5F0]/20">
        <div
          className="h-full bg-[#F5F5F0] transition-all duration-100"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Panel indicators */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentPanel === i ? "bg-[#F5F5F0] scale-125" : "bg-[#F5F5F0]/30"
            }`}
          />
        ))}
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={containerRef}
        className="h-screen overflow-x-auto overflow-y-hidden flex scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Panel 1: Hero */}
        <section className="min-w-screen w-screen h-screen flex-shrink-0 flex items-center justify-center px-16 relative">
          <div className="max-w-4xl">
            <p className="text-sm tracking-[0.5em] uppercase opacity-40 mb-8">
              Scroll to explore →
            </p>
            <h1
              className="text-[clamp(4rem,12vw,10rem)] font-light leading-[0.85] tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Therapy
              <br />
              <span className="italic">reimagined.</span>
            </h1>
          </div>
          {/* Decorative line */}
          <div className="absolute right-0 top-1/2 w-32 h-px bg-gradient-to-r from-[#F5F5F0]/50 to-transparent" />
        </section>

        {/* Panel 2: The Problem */}
        <section className="min-w-screen w-screen h-screen flex-shrink-0 flex items-center px-16 relative bg-[#1A1A1A]">
          <div className="grid grid-cols-2 gap-16 w-full max-w-6xl mx-auto">
            <div className="flex flex-col justify-center">
              <p className="text-sm tracking-[0.3em] uppercase opacity-40 mb-6">
                The Problem
              </p>
              <h2
                className="text-5xl leading-tight mb-8"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Therapy materials
                <br />
                haven't evolved.
              </h2>
              <p className="text-lg opacity-60 leading-relaxed">
                Clip art from 2005. Generic worksheets. Materials that make
                both therapists and clients cringe.
              </p>
            </div>
            <div className="flex items-center justify-center">
              {/* Animated "bad" cards */}
              <div className="relative w-64 h-80">
                <div
                  className="absolute inset-0 bg-[#333] rounded-lg flex items-center justify-center animate-pulse"
                  style={{ animationDuration: "3s" }}
                >
                  <span className="text-6xl opacity-30">😊</span>
                </div>
                <div
                  className="absolute inset-0 bg-[#444] rounded-lg flex items-center justify-center -rotate-6 -translate-x-4"
                  style={{ animation: "float 4s ease-in-out infinite" }}
                >
                  <span className="text-6xl opacity-30">😢</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel 3: The Solution */}
        <section className="min-w-screen w-screen h-screen flex-shrink-0 flex items-center px-16 relative bg-[#E8E4DC] text-[#1A1A1A]">
          <div className="w-full max-w-6xl mx-auto">
            <p className="text-sm tracking-[0.3em] uppercase opacity-40 mb-6">
              The Solution
            </p>
            <h2
              className="text-[clamp(3rem,8vw,7rem)] leading-[0.9] mb-12"
              style={{ fontFamily: "Georgia, serif" }}
            >
              AI-powered.
              <br />
              <span className="italic">Human-centered.</span>
            </h2>
            <div className="flex gap-4">
              {["Style", "Emotions", "Generate", "Print"].map((step, i) => (
                <div
                  key={step}
                  className="flex-1 p-6 bg-[#1A1A1A] text-[#E8E4DC]"
                  style={{
                    animation: `slideUp 0.6s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <span className="text-xs opacity-40">0{i + 1}</span>
                  <p className="text-lg mt-2">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panel 4: Showcase */}
        <section className="min-w-[150vw] w-[150vw] h-screen flex-shrink-0 flex items-center px-16 relative overflow-hidden">
          <div className="flex gap-8 items-center">
            {/* Large showcase cards */}
            {[
              { emotion: "Calm", bg: "#5B7B6F", rotate: -3 },
              { emotion: "Joy", bg: "#D4956A", rotate: 2 },
              { emotion: "Sad", bg: "#6B7B9E", rotate: -1 },
              { emotion: "Brave", bg: "#9B6B7B", rotate: 3 },
              { emotion: "Worried", bg: "#7B8B6B", rotate: -2 },
            ].map((card, i) => (
              <div
                key={card.emotion}
                className="w-72 h-96 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl transition-transform duration-500 hover:scale-105 hover:rotate-0"
                style={{
                  backgroundColor: card.bg,
                  transform: `rotate(${card.rotate}deg)`,
                }}
              >
                <div className="w-32 h-32 rounded-full bg-white/20 mb-6" />
                <span className="text-2xl font-light">{card.emotion}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Panel 5: CTA */}
        <section className="min-w-screen w-screen h-screen flex-shrink-0 flex items-center justify-center px-16 relative">
          <div className="text-center">
            <h2
              className="text-[clamp(3rem,10vw,8rem)] font-light leading-[0.9] mb-12"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ready to
              <br />
              <span className="italic">begin?</span>
            </h2>
            <Link
              href="/signup"
              className="inline-block text-lg border-b-2 border-[#F5F5F0] pb-2 hover:pb-4 transition-all"
            >
              Start your free trial →
            </Link>
            <p className="mt-8 text-sm opacity-40">
              14 days free · No credit card
            </p>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: rotate(-6deg) translateX(-16px) translateY(0); }
          50% { transform: rotate(-6deg) translateX(-16px) translateY(-20px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .min-w-screen { min-width: 100vw; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
