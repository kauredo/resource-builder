"use client";

import Link from "next/link";

/**
 * DESIGN 6: THE DAILY THERAPIST (Newspaper Broadsheet)
 *
 * Concept: A full newspaper front page layout. Masthead, columns, headlines,
 * bylines, pull quotes, classified-style sections. Feels like discovering
 * the product through journalism. Serif typography, tight columns, rules.
 *
 * Memorable element: The authentic newspaper aesthetic and reading experience
 */

export default function NewspaperPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{
        backgroundColor: "#F5F1E8",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Masthead */}
        <header className="border-b-2 border-[#1a1a1a] pb-4 mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span>Vol. CXXIV... No. 42,891</span>
            <span>FOUNDED 2024</span>
            <span>{today}</span>
          </div>
          <h1
            className="text-center text-6xl md:text-8xl tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            The Daily Therapist
          </h1>
          <p className="text-center text-sm mt-2 tracking-[0.5em] uppercase">
            All the Resources Fit to Print
          </p>
        </header>

        {/* Navigation bar styled as newspaper sections */}
        <nav className="flex justify-center gap-8 py-3 border-y border-[#1a1a1a]/30 mb-6 text-sm">
          <Link href="/login" className="hover:underline">Member Login</Link>
          <span className="text-[#1a1a1a]/30">|</span>
          <Link href="/signup" className="font-bold hover:underline">Subscribe Today</Link>
          <span className="text-[#1a1a1a]/30">|</span>
          <span className="text-[#1a1a1a]/50">Weather: Calm</span>
        </nav>

        {/* Main content grid - newspaper columns */}
        <div className="grid grid-cols-12 gap-6">
          {/* Lead story - spans 8 columns */}
          <article className="col-span-12 md:col-span-8 border-r-0 md:border-r border-[#1a1a1a]/20 pr-0 md:pr-6">
            <p className="text-xs uppercase tracking-widest text-[#8B0000] mb-2">
              Breaking Development
            </p>
            <h2
              className="text-4xl md:text-5xl leading-[1.1] mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Revolutionary Platform Transforms
              How Therapists Create Materials
            </h2>
            <p className="text-sm mb-4 italic">
              AI-powered tool generates consistent, print-ready emotion cards in minutes
            </p>
            <div className="flex gap-4 text-xs text-[#1a1a1a]/60 mb-4">
              <span>By THE EDITORIAL BOARD</span>
              <span>|</span>
              <span>5 min read</span>
            </div>

            {/* Fake article image placeholder */}
            <div className="bg-[#1a1a1a]/10 aspect-[16/9] mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="grid grid-cols-3 gap-2 p-8">
                {["Happy", "Calm", "Brave"].map((emotion, i) => (
                  <div
                    key={emotion}
                    className="w-20 h-28 rounded bg-white shadow-md flex flex-col items-center justify-center"
                    style={{ transform: `rotate(${(i - 1) * 5}deg)` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#D4956A]/30 mb-2" />
                    <span className="text-xs">{emotion}</span>
                  </div>
                ))}
              </div>
              <p className="absolute bottom-2 right-2 text-xs italic text-[#1a1a1a]/40">
                Example emotion cards created with the platform
              </p>
            </div>

            {/* Article text in columns */}
            <div className="columns-1 md:columns-2 gap-6 text-[15px] leading-relaxed text-justify">
              <p className="mb-4">
                <span className="text-4xl float-left mr-2 leading-none" style={{ fontFamily: "Georgia, serif" }}>T</span>
                herapists across the nation are discovering a new approach to creating
                materials for their young clients. Resource Builder, a platform launched
                this year, allows mental health professionals to generate customized
                emotion cards with unprecedented ease.
              </p>
              <p className="mb-4">
                "The consistency is everything," explained Dr. Maria Rodriguez, a play
                therapist who has been using the platform since its beta release. "Same
                character, same style, building trust with every session."
              </p>
              <p className="mb-4">
                The platform offers five curated style presets—from warm and playful to
                calm and minimal—while also allowing practitioners to create entirely
                custom visual languages for their practices.
              </p>
              <p className="mb-4">
                Unlike traditional clip art solutions that have dominated the field for
                decades, Resource Builder uses artificial intelligence to generate
                cohesive illustrations that maintain stylistic consistency across an
                entire deck of emotion cards.
              </p>
            </div>
          </article>

          {/* Sidebar - 4 columns */}
          <aside className="col-span-12 md:col-span-4 space-y-6">
            {/* Subscribe box */}
            <div className="border-2 border-[#1a1a1a] p-4 bg-white">
              <p className="text-xs uppercase tracking-widest mb-2">Special Offer</p>
              <h3 className="text-xl mb-3" style={{ fontFamily: "Georgia, serif" }}>
                14 Days Free Trial
              </h3>
              <p className="text-sm mb-4 text-[#1a1a1a]/70">
                No credit card required. Cancel anytime.
              </p>
              <Link
                href="/signup"
                className="block text-center py-3 bg-[#1a1a1a] text-[#F5F1E8] hover:bg-[#8B0000] transition-colors"
              >
                Subscribe Now →
              </Link>
            </div>

            {/* Secondary story */}
            <article className="border-t-2 border-[#1a1a1a] pt-4">
              <p className="text-xs uppercase tracking-widest text-[#1a1a1a]/50 mb-2">
                Features
              </p>
              <h3 className="text-xl mb-2" style={{ fontFamily: "Georgia, serif" }}>
                Five Style Presets Transform Practice Branding
              </h3>
              <p className="text-sm text-[#1a1a1a]/70">
                Warm & Playful, Calm & Minimal, Bold & Colorful, Nature & Earthy,
                and Whimsical Fantasy offer starting points for any therapeutic approach.
              </p>
            </article>

            {/* Third story */}
            <article className="border-t border-[#1a1a1a]/30 pt-4">
              <p className="text-xs uppercase tracking-widest text-[#1a1a1a]/50 mb-2">
                Technology
              </p>
              <h3 className="text-lg mb-2" style={{ fontFamily: "Georgia, serif" }}>
                Print-Ready PDFs Include Professional Cut Lines
              </h3>
              <p className="text-sm text-[#1a1a1a]/70">
                Materials designed for paper, not screens.
              </p>
            </article>

            {/* Pull quote */}
            <blockquote className="border-l-4 border-[#8B0000] pl-4 py-2 italic">
              <p className="text-lg leading-snug" style={{ fontFamily: "Georgia, serif" }}>
                "Finally, emotion cards that don't look like clip art from 2005."
              </p>
              <cite className="text-xs not-italic text-[#1a1a1a]/50 mt-2 block">
                — Dr. Sarah Chen, Child Psychologist
              </cite>
            </blockquote>
          </aside>
        </div>

        {/* Bottom section - Classified style */}
        <section className="mt-8 pt-6 border-t-2 border-[#1a1a1a]">
          <h3 className="text-center text-xs uppercase tracking-[0.5em] mb-6">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="border border-[#1a1a1a]/30 p-4">
              <p className="font-bold mb-1">1. STYLE</p>
              <p className="text-[#1a1a1a]/70">
                Choose from presets or build your own visual language.
              </p>
            </div>
            <div className="border border-[#1a1a1a]/30 p-4">
              <p className="font-bold mb-1">2. EMOTIONS</p>
              <p className="text-[#1a1a1a]/70">
                Select from 20+ research-backed emotional states.
              </p>
            </div>
            <div className="border border-[#1a1a1a]/30 p-4">
              <p className="font-bold mb-1">3. GENERATE</p>
              <p className="text-[#1a1a1a]/70">
                AI creates matching illustrations for each card.
              </p>
            </div>
            <div className="border border-[#1a1a1a]/30 p-4">
              <p className="font-bold mb-1">4. PRINT</p>
              <p className="text-[#1a1a1a]/70">
                Export PDF with cut lines. Ready for sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-[#1a1a1a]/30 flex justify-between text-xs text-[#1a1a1a]/50">
          <p>© 2025 Resource Builder. All Rights Reserved.</p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
