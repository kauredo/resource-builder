"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/**
 * DESIGN 10: CINEMATIC SPOTLIGHT
 *
 * Concept: Deep dark environment with dramatic spotlights that follow
 * cursor and illuminate content. Theatrical, moody, like a film noir
 * or stage production. Content emerges from darkness. Glowing accents.
 *
 * Memorable element: The dramatic spotlight/cursor interaction
 */

export default function CinematicPage() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-[400vh] bg-[#050505] text-[#F5F0E8] relative">
      {/* Spotlight effect that follows cursor */}
      <div
        className="fixed inset-0 pointer-events-none z-10 transition-all duration-200"
        style={{
          background: `radial-gradient(circle 400px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(212, 149, 106, 0.15) 0%, transparent 70%)`,
        }}
      />

      {/* Secondary ambient light */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle 600px at ${50 + mousePos.x * 20}% ${50 + mousePos.y * 20}%, rgba(100, 100, 120, 0.1) 0%, transparent 60%)`,
        }}
      />

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-20 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <Link
          href="/10"
          className="text-sm tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity"
        >
          Resource Builder
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm opacity-40 hover:opacity-100 transition-opacity"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2 bg-[#D4956A] text-[#050505] hover:bg-[#E8B86D] transition-colors"
          >
            Start Free
          </Link>
        </div>
      </header>

      <main className="relative z-30">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center px-8 relative">
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D4956A] rounded-full opacity-20"
              style={{
                left: `${10 + (i * 17) % 80}%`,
                top: `${10 + (i * 23) % 80}%`,
                animation: `float ${3 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}

          <div className="text-center relative">
            {/* Glowing text effect */}
            <p className="text-xs tracking-[0.5em] uppercase opacity-50 mb-8">
              For Therapists
            </p>
            <h1
              className="text-6xl md:text-9xl font-light leading-[0.85] mb-8"
              style={{
                fontFamily: "Georgia, serif",
                textShadow: "0 0 80px rgba(212, 149, 106, 0.3)",
              }}
            >
              Illuminate
              <br />
              <span className="text-[#D4956A]" style={{ textShadow: "0 0 60px rgba(212, 149, 106, 0.6)" }}>
                Healing
              </span>
            </h1>
            <p className="text-xl opacity-40 max-w-lg mx-auto mb-12">
              Create therapy materials that emerge from intention.
            </p>
            <Link
              href="/signup"
              className="inline-block px-12 py-5 border border-[#D4956A] text-[#D4956A] hover:bg-[#D4956A] hover:text-[#050505] transition-all duration-500"
              style={{ boxShadow: "0 0 30px rgba(212, 149, 106, 0.2)" }}
            >
              Begin Your Trial
            </Link>
          </div>
        </section>

        {/* Cards section with spotlight reveals */}
        <section className="min-h-screen py-32 px-8">
          <div className="max-w-5xl mx-auto">
            <h2
              className="text-4xl md:text-6xl text-center mb-24 opacity-80"
              style={{
                fontFamily: "Georgia, serif",
                textShadow: "0 0 40px rgba(212, 149, 106, 0.2)",
              }}
            >
              Emotion Cards
            </h2>

            {/* Cards grid with glow effects */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { name: "Joy", color: "#E8B86D" },
                { name: "Calm", color: "#7BA897" },
                { name: "Sadness", color: "#7B8FAF" },
                { name: "Courage", color: "#AF7B8F" },
                { name: "Worry", color: "#8FAF7B" },
                { name: "Pride", color: "#D4956A" },
              ].map((card) => (
                <div
                  key={card.name}
                  className="aspect-[3/4] rounded-lg flex flex-col items-center justify-center relative group cursor-pointer transition-transform duration-500 hover:scale-105"
                  style={{
                    backgroundColor: `${card.color}15`,
                    border: `1px solid ${card.color}30`,
                  }}
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `0 0 60px ${card.color}40, inset 0 0 30px ${card.color}10`,
                    }}
                  />
                  <div
                    className="w-20 h-20 rounded-full mb-4 transition-all duration-500 group-hover:scale-110"
                    style={{
                      backgroundColor: `${card.color}30`,
                      boxShadow: `0 0 30px ${card.color}20`,
                    }}
                  />
                  <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                    {card.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features with dramatic lighting */}
        <section className="min-h-screen py-32 px-8 relative">
          {/* Dramatic side light */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-[600px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at left, rgba(212, 149, 106, 0.1) 0%, transparent 70%)",
            }}
          />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="space-y-32">
              {[
                {
                  num: "01",
                  title: "Define Your Light",
                  desc: "Choose from five curated style presets or craft your own visual language in the darkness.",
                },
                {
                  num: "02",
                  title: "Illuminate Emotions",
                  desc: "20+ research-backed feelings waiting to emerge. From primary states to nuanced depths.",
                },
                {
                  num: "03",
                  title: "Manifest & Print",
                  desc: "AI generates cohesive illustrations. Export print-ready PDFs that carry your light forward.",
                },
              ].map((feature) => (
                <div key={feature.num} className="flex gap-12 items-start">
                  <span
                    className="text-6xl font-light text-[#D4956A] opacity-30"
                    style={{ textShadow: "0 0 30px rgba(212, 149, 106, 0.3)" }}
                  >
                    {feature.num}
                  </span>
                  <div>
                    <h3
                      className="text-3xl mb-4"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-lg opacity-50 max-w-lg">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote with spotlight */}
        <section className="min-h-screen flex items-center justify-center px-8 relative">
          {/* Center spotlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle 400px at 50% 50%, rgba(212, 149, 106, 0.15) 0%, transparent 60%)",
            }}
          />

          <div className="text-center relative z-10 max-w-3xl">
            <blockquote
              className="text-3xl md:text-5xl leading-snug mb-12 opacity-80"
              style={{
                fontFamily: "Georgia, serif",
                textShadow: "0 0 40px rgba(212, 149, 106, 0.2)",
              }}
            >
              "The consistency is everything. Same character, same style, building trust in the light."
            </blockquote>
            <div className="opacity-50">
              <p className="font-medium">Maria Rodriguez</p>
              <p className="text-sm">Play Therapist</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="min-h-screen flex items-center justify-center px-8 relative">
          <div className="text-center">
            <h2
              className="text-5xl md:text-8xl mb-12"
              style={{
                fontFamily: "Georgia, serif",
                textShadow: "0 0 80px rgba(212, 149, 106, 0.4)",
              }}
            >
              Step into
              <br />
              <span className="text-[#D4956A]">the light.</span>
            </h2>
            <Link
              href="/signup"
              className="inline-block px-16 py-6 bg-[#D4956A] text-[#050505] text-lg font-medium hover:scale-105 transition-transform"
              style={{ boxShadow: "0 0 60px rgba(212, 149, 106, 0.4)" }}
            >
              Start Free Trial
            </Link>
            <p className="mt-8 text-sm opacity-30">14 days free · No credit card</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-30 py-8 px-8 flex items-center justify-between text-xs opacity-30">
        <p>© 2025 Resource Builder</p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="hover:opacity-100">Privacy</Link>
          <Link href="/terms" className="hover:opacity-100">Terms</Link>
        </nav>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
