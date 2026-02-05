import Link from "next/link";
import Image from "next/image";

/**
 * DESIGN 1: EDITORIAL / MAGAZINE
 *
 * Aesthetic: Sophisticated editorial design inspired by high-end magazines like Kinfolk,
 * Cereal, and The New York Times Magazine. Heavy use of serif typography, asymmetric
 * layouts, generous white space, and a sense of curated refinement.
 *
 * Memorable element: The oversized typography and magazine-style pull quotes
 */

export default function EditorialPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7] text-[#1a1a1a]">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF9F7]/95 backdrop-blur-sm">
        <nav className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between border-b border-[#1a1a1a]/10">
          <Link href="/1" className="font-serif text-2xl tracking-tight">
            Resource Builder
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-sm tracking-wide hover:text-[#8B4513] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm tracking-wide bg-[#1a1a1a] text-[#FAF9F7] px-5 py-2.5 hover:bg-[#333] transition-colors"
            >
              Begin Trial
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero - Editorial spread */}
        <section className="pt-32 pb-24 px-8">
          <div className="max-w-[1400px] mx-auto">
            {/* Issue number / date styling */}
            <div className="flex items-center gap-6 mb-12 text-sm tracking-[0.2em] text-[#1a1a1a]/50 uppercase">
              <span>Est. 2024</span>
              <span className="w-12 h-px bg-current" aria-hidden="true" />
              <span>For Therapists</span>
            </div>

            {/* Main headline - magazine cover style */}
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-4">
              <div className="lg:col-span-7">
                <h1 className="font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tight mb-8">
                  The Art of
                  <br />
                  <span className="italic">Healing</span>
                  <br />
                  Materials
                </h1>
                <p className="text-xl leading-relaxed text-[#1a1a1a]/70 max-w-xl font-light">
                  Thoughtfully crafted resources for the modern therapist.
                  Emotion cards, worksheets, and visual tools—designed with
                  intention, printed with purpose.
                </p>
              </div>

              {/* Large feature image area */}
              <div className="lg:col-span-5 relative">
                <div className="aspect-[3/4] bg-[#E8E4DE] relative overflow-hidden">
                  {/* Stacked cards composition */}
                  <div className="absolute inset-8 flex items-center justify-center">
                    <div className="relative w-full max-w-[200px]">
                      <div
                        className="absolute -top-4 -left-4 w-32 h-44 bg-[#D4A574] rounded-lg shadow-xl"
                        style={{ transform: "rotate(-8deg)" }}
                      />
                      <div
                        className="absolute top-0 left-8 w-32 h-44 bg-[#7B9E87] rounded-lg shadow-xl"
                        style={{ transform: "rotate(3deg)" }}
                      />
                      <div
                        className="relative w-32 h-44 bg-[#C4A4D4] rounded-lg shadow-xl ml-4 mt-8"
                        style={{ transform: "rotate(-2deg)" }}
                      />
                    </div>
                  </div>
                  {/* Caption */}
                  <p className="absolute bottom-4 left-4 text-xs tracking-[0.15em] text-[#1a1a1a]/40 uppercase">
                    Emotion Cards Collection
                  </p>
                </div>
              </div>
            </div>

            {/* CTA area */}
            <div className="mt-16 flex items-center gap-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 text-lg border-b-2 border-[#1a1a1a] pb-1 hover:border-[#8B4513] hover:text-[#8B4513] transition-colors group"
              >
                Start Creating
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              </Link>
              <span className="text-sm text-[#1a1a1a]/50">
                14 days free, no card required
              </span>
            </div>
          </div>
        </section>

        {/* Pull quote section */}
        <section className="py-24 px-8 border-y border-[#1a1a1a]/10">
          <div className="max-w-[1400px] mx-auto">
            <blockquote className="font-serif text-[clamp(1.5rem,4vw,3rem)] leading-snug text-center max-w-4xl mx-auto italic">
              "The materials we use in therapy sessions speak volumes before we
              say a word. Quality matters."
            </blockquote>
            <p className="text-center mt-8 text-sm tracking-[0.2em] text-[#1a1a1a]/50 uppercase">
              Dr. Maria Santos, Child Psychologist
            </p>
          </div>
        </section>

        {/* Editorial grid - Features */}
        <section className="py-24 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Section label */}
              <div className="lg:col-span-3">
                <p className="text-sm tracking-[0.2em] text-[#1a1a1a]/50 uppercase sticky top-24">
                  The Process
                </p>
              </div>

              {/* Content */}
              <div className="lg:col-span-9">
                <div className="grid md:grid-cols-2 gap-16">
                  <article>
                    <span className="font-serif text-6xl text-[#1a1a1a]/10">
                      01
                    </span>
                    <h3 className="font-serif text-2xl mt-4 mb-4">
                      Define Your Visual Language
                    </h3>
                    <p className="text-[#1a1a1a]/70 leading-relaxed">
                      Begin with intention. Select from curated style presets or
                      craft a custom aesthetic that reflects your therapeutic
                      approach and resonates with young minds.
                    </p>
                  </article>

                  <article>
                    <span className="font-serif text-6xl text-[#1a1a1a]/10">
                      02
                    </span>
                    <h3 className="font-serif text-2xl mt-4 mb-4">
                      Curate Your Emotions
                    </h3>
                    <p className="text-[#1a1a1a]/70 leading-relaxed">
                      Choose from a research-backed library of emotional states.
                      From foundational feelings to nuanced experiences—build
                      decks tailored to each client's journey.
                    </p>
                  </article>

                  <article>
                    <span className="font-serif text-6xl text-[#1a1a1a]/10">
                      03
                    </span>
                    <h3 className="font-serif text-2xl mt-4 mb-4">
                      Generate With Intelligence
                    </h3>
                    <p className="text-[#1a1a1a]/70 leading-relaxed">
                      AI creates cohesive illustrations that maintain your
                      chosen style across every card. Consistency builds
                      familiarity; familiarity builds trust.
                    </p>
                  </article>

                  <article>
                    <span className="font-serif text-6xl text-[#1a1a1a]/10">
                      04
                    </span>
                    <h3 className="font-serif text-2xl mt-4 mb-4">
                      Print With Precision
                    </h3>
                    <p className="text-[#1a1a1a]/70 leading-relaxed">
                      Export print-ready PDFs with proper cut lines and color
                      optimization. Materials designed for the therapy room, not
                      the screen.
                    </p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature image spread */}
        <section className="py-12">
          <div className="max-w-[1600px] mx-auto px-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="aspect-[4/5] bg-[#D4E4D1] relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-serif text-4xl mb-2">Calm</p>
                    <p className="text-sm tracking-widest uppercase text-[#1a1a1a]/50">
                      & Minimal
                    </p>
                  </div>
                </div>
              </div>
              <div className="aspect-[4/5] bg-[#F4E4D4] relative overflow-hidden group md:mt-12">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-serif text-4xl mb-2">Warm</p>
                    <p className="text-sm tracking-widest uppercase text-[#1a1a1a]/50">
                      & Playful
                    </p>
                  </div>
                </div>
              </div>
              <div className="aspect-[4/5] bg-[#E4D4E9] relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-serif text-4xl mb-2">Whimsical</p>
                    <p className="text-sm tracking-widest uppercase text-[#1a1a1a]/50">
                      & Fantasy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials - Editorial style */}
        <section className="py-24 px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <p className="text-sm tracking-[0.2em] text-[#1a1a1a]/50 uppercase sticky top-24">
                  Practitioners
                </p>
              </div>

              <div className="lg:col-span-9 space-y-16">
                <figure className="border-t border-[#1a1a1a]/10 pt-8">
                  <blockquote className="font-serif text-2xl leading-relaxed mb-6">
                    "These materials have transformed how I introduce emotional
                    concepts to children. The consistency in style helps build
                    recognition session after session."
                  </blockquote>
                  <figcaption className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#D4A574]/30 flex items-center justify-center font-serif text-lg">
                      SC
                    </div>
                    <div>
                      <p className="font-medium">Dr. Sarah Chen</p>
                      <p className="text-sm text-[#1a1a1a]/50">
                        Child Psychologist, Boston
                      </p>
                    </div>
                  </figcaption>
                </figure>

                <figure className="border-t border-[#1a1a1a]/10 pt-8">
                  <blockquote className="font-serif text-2xl leading-relaxed mb-6">
                    "Finally, professional-quality resources that don't require
                    a design degree. The print quality is exceptional."
                  </blockquote>
                  <figcaption className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#7B9E87]/30 flex items-center justify-center font-serif text-lg">
                      JT
                    </div>
                    <div>
                      <p className="font-medium">James Thompson</p>
                      <p className="text-sm text-[#1a1a1a]/50">
                        School Counselor, Seattle
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-8 bg-[#1a1a1a] text-[#FAF9F7]">
          <div className="max-w-[1400px] mx-auto text-center">
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] leading-tight mb-8">
              Begin your practice's
              <br />
              <span className="italic">visual evolution</span>
            </h2>
            <Link
              href="/signup"
              className="inline-flex items-center gap-3 text-lg border-b border-[#FAF9F7] pb-1 hover:border-[#D4A574] hover:text-[#D4A574] transition-colors"
            >
              Start Free Trial
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-[#1a1a1a]/10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-serif text-lg">Resource Builder</p>
          <nav aria-label="Footer">
            <ul className="flex gap-8 text-sm text-[#1a1a1a]/50">
              <li>
                <Link href="/privacy" className="hover:text-[#1a1a1a]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1a1a1a]">
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@resourcebuilder.app"
                  className="hover:text-[#1a1a1a]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
