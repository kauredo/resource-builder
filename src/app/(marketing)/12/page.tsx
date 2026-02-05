"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * DESIGN 12: BENTO GRID EXPLOSION
 *
 * Concept: A dynamic, asymmetric bento-box grid that feels like a dashboard
 * meets art installation. Interactive tiles that expand, animate, and reveal
 * content on hover. Dense information architecture with visual breathing room.
 *
 * Memorable element: The interactive, expanding grid tiles with dramatic hovers
 */

export default function BentoGridPage() {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F0EBE3] text-[#1C1C1C] p-4 md:p-6">
      {/* Header integrated into grid */}
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/12"
          className="text-xl font-medium tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Resource Builder
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm hover:underline">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm px-5 py-2.5 bg-[#1C1C1C] text-[#F0EBE3] hover:bg-[#333] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 grid-rows-[repeat(8,minmax(80px,1fr))] gap-4 min-h-[calc(100vh-120px)]">
        {/* Hero tile - spans 8 cols, 3 rows */}
        <div
          className="col-span-12 md:col-span-8 row-span-3 bg-[#1C1C1C] text-[#F0EBE3] p-8 md:p-12 flex flex-col justify-between group cursor-pointer overflow-hidden relative"
          onMouseEnter={() => setHoveredTile("hero")}
          onMouseLeave={() => setHoveredTile(null)}
        >
          <div className="relative z-10">
            <p className="text-sm tracking-[0.3em] uppercase opacity-50 mb-4">
              For Therapists
            </p>
            <h1
              className="text-4xl md:text-6xl leading-[0.95] transition-transform duration-500 group-hover:-translate-y-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Create therapy
              <br />
              materials that
              <br />
              <em className="not-italic text-[#D4A574]">actually work.</em>
            </h1>
          </div>
          <p className="text-sm opacity-60 max-w-md relative z-10">
            AI-powered emotion cards, worksheets, and visual tools. Consistent
            style. Print-ready.
          </p>
          {/* Background animation */}
          <div
            className={`absolute inset-0 bg-[#D4A574] transition-transform duration-700 ease-out ${
              hoveredTile === "hero" ? "translate-y-0" : "translate-y-full"
            }`}
          />
        </div>

        {/* Stats tile */}
        <div className="col-span-6 md:col-span-2 row-span-2 bg-[#D4A574] p-6 flex flex-col justify-center items-center text-center group hover:bg-[#C49564] transition-colors">
          <span
            className="text-5xl md:text-6xl font-light group-hover:scale-110 transition-transform"
            style={{ fontFamily: "Georgia, serif" }}
          >
            500+
          </span>
          <span className="text-xs tracking-wider uppercase mt-2 opacity-70">
            Therapists
          </span>
        </div>

        {/* CTA tile */}
        <div className="col-span-6 md:col-span-2 row-span-2 bg-[#5B7B6F] text-white p-6 flex flex-col justify-between group hover:bg-[#4A6A5E] transition-colors">
          <span className="text-xs tracking-wider uppercase opacity-70">
            Start Free
          </span>
          <div>
            <p className="text-2xl mb-2" style={{ fontFamily: "Georgia, serif" }}>
              14 days
            </p>
            <Link
              href="/signup"
              className="text-sm underline underline-offset-4 group-hover:no-underline"
            >
              Begin trial →
            </Link>
          </div>
        </div>

        {/* Feature 1 - Style */}
        <div
          className="col-span-12 md:col-span-4 row-span-2 bg-white p-6 group cursor-pointer relative overflow-hidden"
          onMouseEnter={() => setHoveredTile("style")}
          onMouseLeave={() => setHoveredTile(null)}
        >
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <span className="text-xs tracking-wider uppercase opacity-40">01</span>
              <h3
                className="text-2xl mt-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Choose Your Style
              </h3>
            </div>
            <p className="text-sm opacity-60">
              5 curated presets or build your own visual language.
            </p>
          </div>
          {/* Color swatches that animate in */}
          <div
            className={`absolute bottom-0 right-0 flex gap-1 p-4 transition-all duration-500 ${
              hoveredTile === "style"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            {["#D4A574", "#5B7B6F", "#6B7B9E", "#9B6B7B", "#7B8B6B"].map((c) => (
              <div
                key={c}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Feature 2 - Emotions */}
        <div className="col-span-6 md:col-span-4 row-span-2 bg-[#E8E4DC] p-6 flex flex-col justify-between group hover:bg-[#DDD8D0] transition-colors">
          <div>
            <span className="text-xs tracking-wider uppercase opacity-40">02</span>
            <h3 className="text-2xl mt-2" style={{ fontFamily: "Georgia, serif" }}>
              Select Emotions
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Happy", "Sad", "Calm", "Worried", "+16"].map((e) => (
              <span
                key={e}
                className="text-xs px-3 py-1 bg-[#1C1C1C]/10 group-hover:bg-[#1C1C1C] group-hover:text-white transition-colors"
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Feature 3 - Generate */}
        <div className="col-span-6 md:col-span-4 row-span-2 bg-[#1C1C1C] text-[#F0EBE3] p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-xs tracking-wider uppercase opacity-40">03</span>
            <h3 className="text-2xl mt-2" style={{ fontFamily: "Georgia, serif" }}>
              Generate & Print
            </h3>
          </div>
          <p className="text-sm opacity-60">AI illustrations. PDF export.</p>
          {/* Animated lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F0EBE3]/20 to-transparent"
              style={{ animation: "scanLine 3s ease-in-out infinite" }}
            />
            <div
              className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F0EBE3]/20 to-transparent"
              style={{ animation: "scanLine 3s ease-in-out 1s infinite" }}
            />
            <div
              className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F0EBE3]/20 to-transparent"
              style={{ animation: "scanLine 3s ease-in-out 2s infinite" }}
            />
          </div>
        </div>

        {/* Testimonial tile */}
        <div className="col-span-12 md:col-span-6 row-span-2 bg-white p-8 flex flex-col justify-center">
          <blockquote
            className="text-xl md:text-2xl leading-relaxed mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            "My clients actually engage with these materials. The design makes
            all the difference."
          </blockquote>
          <p className="text-sm opacity-50">Dr. Sarah Chen, Child Psychologist</p>
        </div>

        {/* Card showcase tile */}
        <div className="col-span-12 md:col-span-6 row-span-2 bg-[#5B7B6F] p-6 flex items-center justify-center relative overflow-hidden group">
          <div className="flex gap-3 transition-transform duration-500 group-hover:scale-105">
            {[
              { bg: "#F4D1D1", label: "Happy" },
              { bg: "#D1E8D4", label: "Calm" },
              { bg: "#D1D4E8", label: "Sad" },
            ].map((card, i) => (
              <div
                key={card.label}
                className="w-24 h-32 rounded-lg flex flex-col items-center justify-center transition-transform duration-300 hover:-translate-y-2"
                style={{
                  backgroundColor: card.bg,
                  transform: `rotate(${(i - 1) * 5}deg)`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-white/50 mb-2" />
                <span className="text-xs text-[#1C1C1C]">{card.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="col-span-12 row-span-1 bg-[#D4A574] p-6 flex items-center justify-between group hover:bg-[#C49564] transition-colors">
          <p
            className="text-xl md:text-2xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Ready to create something beautiful?
          </p>
          <Link
            href="/signup"
            className="text-sm px-6 py-3 bg-[#1C1C1C] text-[#F0EBE3] hover:bg-[#333] transition-colors whitespace-nowrap"
          >
            Start Free Trial →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 flex items-center justify-between text-xs opacity-50">
        <p>© 2025 Resource Builder</p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="hover:opacity-100">Privacy</Link>
          <Link href="/terms" className="hover:opacity-100">Terms</Link>
        </nav>
      </footer>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
