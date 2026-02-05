"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

/**
 * DESIGN 7: DRAMATIC SCROLL REVEALS
 *
 * Concept: Content sections that animate in dramatically as you scroll.
 * Elements fly in from different directions, scale up, fade in with stagger.
 * Each section is a theatrical reveal. Intersection Observer magic.
 *
 * Memorable element: The theatrical, cinematic section transitions
 */

export default function ScrollRevealsPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.2, rootMargin: "-50px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#E8E4DC] overflow-hidden">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between mix-blend-difference">
        <Link href="/7" className="text-sm tracking-[0.2em] uppercase">
          Resource Builder
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm opacity-60 hover:opacity-100">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm border border-current px-5 py-2 hover:bg-[#E8E4DC] hover:text-[#0C0C0C] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      <main>
        {/* Section 1: Hero - Words fly in from edges */}
        <section
          id="hero"
          data-reveal
          className="min-h-screen flex items-center justify-center px-8 relative"
        >
          <div className="text-center">
            <div className="overflow-hidden mb-4">
              <p
                className={`text-sm tracking-[0.5em] uppercase text-[#D4956A] transition-all duration-1000 ${
                  isVisible("hero")
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-full opacity-0"
                }`}
              >
                For Therapists
              </p>
            </div>

            <h1 className="text-5xl md:text-8xl font-light leading-[0.9]" style={{ fontFamily: "Georgia, serif" }}>
              <div className="overflow-hidden">
                <span
                  className={`inline-block transition-all duration-1000 delay-200 ${
                    isVisible("hero")
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0"
                  }`}
                >
                  Create
                </span>
              </div>
              <div className="overflow-hidden">
                <span
                  className={`inline-block transition-all duration-1000 delay-400 ${
                    isVisible("hero")
                      ? "translate-x-0 opacity-100"
                      : "translate-x-full opacity-0"
                  }`}
                >
                  materials
                </span>
              </div>
              <div className="overflow-hidden">
                <span
                  className={`inline-block text-[#D4956A] transition-all duration-1000 delay-600 ${
                    isVisible("hero")
                      ? "translate-y-0 opacity-100 scale-100"
                      : "translate-y-full opacity-0 scale-150"
                  }`}
                >
                  that heal.
                </span>
              </div>
            </h1>

            <div
              className={`mt-12 transition-all duration-1000 delay-1000 ${
                isVisible("hero") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Link
                href="/signup"
                className="inline-block px-10 py-4 bg-[#D4956A] text-[#0C0C0C] font-medium hover:scale-105 transition-transform"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div
              className={`flex flex-col items-center gap-3 transition-all duration-1000 delay-1500 ${
                isVisible("hero") ? "opacity-40" : "opacity-0"
              }`}
            >
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <div className="w-px h-16 bg-gradient-to-b from-current to-transparent" />
            </div>
          </div>
        </section>

        {/* Section 2: Cards explode outward */}
        <section
          id="cards"
          data-reveal
          className="min-h-screen flex items-center justify-center px-8 py-24"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p
                className={`text-xs tracking-[0.3em] uppercase text-[#D4956A] mb-4 transition-all duration-700 ${
                  isVisible("cards") ? "opacity-100" : "opacity-0"
                }`}
              >
                Emotion Cards
              </p>
              <h2
                className={`text-4xl md:text-6xl transition-all duration-1000 ${
                  isVisible("cards") ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
                style={{ fontFamily: "Georgia, serif" }}
              >
                Beautiful by default.
              </h2>
            </div>

            {/* Cards that explode from center */}
            <div className="relative h-[400px] flex items-center justify-center">
              {[
                { emotion: "Joy", bg: "#E8B86D", x: -200, y: -80, rotate: -12, delay: 0 },
                { emotion: "Calm", bg: "#7BA897", x: 0, y: -100, rotate: 3, delay: 100 },
                { emotion: "Sad", bg: "#7B8FAF", x: 200, y: -60, rotate: 15, delay: 200 },
                { emotion: "Brave", bg: "#AF7B8F", x: -150, y: 100, rotate: -8, delay: 300 },
                { emotion: "Worried", bg: "#8FAF7B", x: 150, y: 120, rotate: 10, delay: 400 },
              ].map((card) => (
                <div
                  key={card.emotion}
                  className="absolute w-32 h-44 rounded-xl flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-1000 ease-out hover:scale-110 hover:rotate-0 cursor-pointer"
                  style={{
                    backgroundColor: card.bg,
                    transform: isVisible("cards")
                      ? `translate(${card.x}px, ${card.y}px) rotate(${card.rotate}deg)`
                      : "translate(0, 0) rotate(0deg) scale(0)",
                    opacity: isVisible("cards") ? 1 : 0,
                    transitionDelay: `${card.delay}ms`,
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 mb-3" />
                  <span className="font-medium">{card.emotion}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Features slide in from alternating sides */}
        <section
          id="features"
          data-reveal
          className="min-h-screen py-32 px-8"
        >
          <div className="max-w-4xl mx-auto space-y-32">
            {[
              {
                num: "01",
                title: "Choose Your Style",
                desc: "Five curated presets or build your own visual language. Colors, typography, illustration style.",
                align: "left",
              },
              {
                num: "02",
                title: "Select Emotions",
                desc: "20+ research-backed feelings. Primary to nuanced. Add your own custom emotions.",
                align: "right",
              },
              {
                num: "03",
                title: "Generate & Print",
                desc: "AI creates matching illustrations. Export print-ready PDF with cut lines.",
                align: "left",
              },
            ].map((feature, i) => (
              <div
                key={feature.num}
                className={`flex ${feature.align === "right" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg transition-all duration-1000 ${
                    isVisible("features")
                      ? "opacity-100 translate-x-0"
                      : `opacity-0 ${feature.align === "right" ? "translate-x-32" : "-translate-x-32"}`
                  }`}
                  style={{ transitionDelay: `${i * 300}ms` }}
                >
                  <span className="text-6xl font-light text-[#D4956A]/30">{feature.num}</span>
                  <h3
                    className="text-3xl md:text-4xl mt-4 mb-4"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-lg text-[#E8E4DC]/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Quote scales up dramatically */}
        <section
          id="quote"
          data-reveal
          className="min-h-screen flex items-center justify-center px-8 py-24 bg-[#D4956A] text-[#0C0C0C]"
        >
          <div className="max-w-4xl mx-auto text-center">
            <blockquote
              className={`text-3xl md:text-5xl leading-snug transition-all duration-1500 ${
                isVisible("quote") ? "opacity-100 scale-100" : "opacity-0 scale-50"
              }`}
              style={{ fontFamily: "Georgia, serif" }}
            >
              "The consistency is everything. Same character, same style,
              building trust with every session."
            </blockquote>
            <div
              className={`mt-12 transition-all duration-1000 delay-500 ${
                isVisible("quote") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <p className="font-medium text-lg">Maria Rodriguez</p>
              <p className="text-sm opacity-60">Play Therapist</p>
            </div>
          </div>
        </section>

        {/* Section 5: CTA - elements converge from all corners */}
        <section
          id="cta"
          data-reveal
          className="min-h-screen flex items-center justify-center px-8 py-24 relative overflow-hidden"
        >
          {/* Corner elements that fly in */}
          <div
            className={`absolute top-20 left-20 w-32 h-32 border border-[#D4956A]/30 transition-all duration-1000 ${
              isVisible("cta") ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-full -translate-y-full"
            }`}
          />
          <div
            className={`absolute top-20 right-20 w-24 h-24 bg-[#D4956A]/10 rounded-full transition-all duration-1000 delay-200 ${
              isVisible("cta") ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-full -translate-y-full"
            }`}
          />
          <div
            className={`absolute bottom-20 left-20 w-20 h-20 bg-[#D4956A]/20 transition-all duration-1000 delay-400 ${
              isVisible("cta") ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-full translate-y-full"
            }`}
          />
          <div
            className={`absolute bottom-20 right-20 w-28 h-28 border-2 border-[#D4956A]/20 rounded-full transition-all duration-1000 delay-600 ${
              isVisible("cta") ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-full translate-y-full"
            }`}
          />

          <div className="text-center relative z-10">
            <h2
              className={`text-5xl md:text-7xl mb-8 transition-all duration-1000 delay-300 ${
                isVisible("cta") ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ready to
              <br />
              <em className="text-[#D4956A]">begin?</em>
            </h2>
            <Link
              href="/signup"
              className={`inline-block px-12 py-5 bg-[#D4956A] text-[#0C0C0C] text-lg font-medium hover:scale-105 transition-all duration-1000 delay-700 ${
                isVisible("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Start Free Trial →
            </Link>
            <p
              className={`mt-6 text-sm opacity-40 transition-all duration-1000 delay-900 ${
                isVisible("cta") ? "opacity-40" : "opacity-0"
              }`}
            >
              14 days free · No credit card
            </p>
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
    </div>
  );
}
