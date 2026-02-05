import Link from "next/link";

/**
 * DESIGN 3: GEOMETRIC BRUTALIST
 *
 * Aesthetic: Bold, architectural, stark. Inspired by Bauhaus, constructivism,
 * and modern brutalist web design. Heavy geometric shapes, high contrast,
 * intentional asymmetry, and confident typography.
 *
 * Memorable element: The bold geometric shapes and unexpected color blocks
 */

export default function BrutalistPage() {
  return (
    <div className="min-h-screen bg-[#F0EDE8] text-[#1C1C1C]">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#FF5722] focus:text-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F0EDE8] border-b-4 border-[#1C1C1C]">
        <nav className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/3"
            className="text-xl font-bold tracking-tight uppercase"
          >
            Resource
            <br />
            Builder
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold uppercase tracking-wider hover:text-[#FF5722] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold uppercase tracking-wider bg-[#1C1C1C] text-[#F0EDE8] px-6 py-3 hover:bg-[#FF5722] transition-colors"
            >
              Start Now
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 min-h-screen flex items-center">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left column - Big shapes */}
              <div className="lg:col-span-5 relative h-[500px]">
                {/* Large circle */}
                <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#FF5722]" />
                {/* Rectangle */}
                <div className="absolute top-32 left-24 w-48 h-72 bg-[#1C1C1C]" />
                {/* Small circle */}
                <div className="absolute bottom-0 right-8 w-32 h-32 rounded-full border-4 border-[#1C1C1C]" />
                {/* Yellow accent */}
                <div className="absolute top-48 right-0 w-24 h-24 bg-[#FFB800]" />
              </div>

              {/* Right column - Content */}
              <div className="lg:col-span-7">
                <p className="text-sm font-bold uppercase tracking-[0.3em] mb-6 text-[#FF5722]">
                  Therapy Materials
                </p>
                <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.85] tracking-tight uppercase mb-8">
                  Build
                  <br />
                  Better
                  <br />
                  <span className="text-[#FF5722]">Tools</span>
                </h1>
                <p className="text-xl max-w-lg mb-10 leading-relaxed">
                  Create emotion cards, worksheets, and visual resources for
                  therapy sessions. Bold design. Consistent style. Ready to
                  print.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-4 text-lg font-bold uppercase tracking-wider bg-[#1C1C1C] text-[#F0EDE8] px-8 py-5 hover:bg-[#FF5722] transition-colors group"
                  >
                    Get Started
                    <svg
                      className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="square"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#process"
                    className="inline-flex items-center gap-4 text-lg font-bold uppercase tracking-wider border-4 border-[#1C1C1C] px-8 py-4 hover:bg-[#1C1C1C] hover:text-[#F0EDE8] transition-colors"
                  >
                    How It Works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-[#1C1C1C] text-[#F0EDE8] py-8">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-[#FF5722]">
                  500+
                </p>
                <p className="text-sm uppercase tracking-wider mt-2 opacity-70">
                  Therapists
                </p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-[#FFB800]">
                  20+
                </p>
                <p className="text-sm uppercase tracking-wider mt-2 opacity-70">
                  Emotions
                </p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-[#4CAF50]">
                  5
                </p>
                <p className="text-sm uppercase tracking-wider mt-2 opacity-70">
                  Style Presets
                </p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold text-[#2196F3]">
                  ∞
                </p>
                <p className="text-sm uppercase tracking-wider mt-2 opacity-70">
                  Custom Options
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="py-24 px-6 scroll-mt-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight">
                The
                <br />
                Process
              </h2>
              <p className="text-lg max-w-md">
                Three steps from concept to printed materials. No design
                experience required.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-0">
              {/* Step 1 */}
              <div className="border-4 border-[#1C1C1C] p-8 bg-[#FF5722] text-white">
                <span className="text-8xl font-bold opacity-30">01</span>
                <h3 className="text-2xl font-bold uppercase mt-4 mb-4">
                  Select Style
                </h3>
                <p className="opacity-90">
                  Choose from bold presets or define your own visual language.
                  Colors, typography, illustration style.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border-4 border-l-0 border-[#1C1C1C] p-8 bg-[#FFB800]">
                <span className="text-8xl font-bold opacity-30">02</span>
                <h3 className="text-2xl font-bold uppercase mt-4 mb-4">
                  Pick Emotions
                </h3>
                <p className="opacity-90">
                  20+ research-backed emotions. Primary feelings to nuanced
                  states. Add custom emotions.
                </p>
              </div>

              {/* Step 3 */}
              <div className="border-4 border-l-0 border-[#1C1C1C] p-8 bg-[#4CAF50] text-white">
                <span className="text-8xl font-bold opacity-30">03</span>
                <h3 className="text-2xl font-bold uppercase mt-4 mb-4">
                  Generate & Print
                </h3>
                <p className="opacity-90">
                  AI creates matching illustrations. Export print-ready PDF with
                  cut lines. Done.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature blocks */}
        <section className="py-24 px-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#1C1C1C] text-[#F0EDE8] p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5722]" />
                <h3 className="text-3xl font-bold uppercase mb-4 relative z-10">
                  Consistent
                  <br />
                  Characters
                </h3>
                <p className="text-lg opacity-80 relative z-10 max-w-sm">
                  Same character across all materials. Builds familiarity. Helps
                  anxious kids feel safe.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#2196F3] text-white p-12 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1C1C1C]" />
                <h3 className="text-3xl font-bold uppercase mb-4 relative z-10">
                  Print
                  <br />
                  Optimized
                </h3>
                <p className="text-lg opacity-90 relative z-10 max-w-sm">
                  Colors calibrated for paper. Cut lines included. Card sizes
                  fit tiny hands.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border-4 border-[#1C1C1C] p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-16 h-16 bg-[#FFB800]" />
                <h3 className="text-3xl font-bold uppercase mb-4 relative z-10">
                  Your Brand
                  <br />
                  Everywhere
                </h3>
                <p className="text-lg opacity-80 relative z-10 max-w-sm">
                  Unified visual style. Parents recognize your materials. Kids
                  feel continuity.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#9C27B0] text-white p-12 relative overflow-hidden">
                <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-4 border-white opacity-30" />
                <h3 className="text-3xl font-bold uppercase mb-4 relative z-10">
                  AI
                  <br />
                  Powered
                </h3>
                <p className="text-lg opacity-90 relative z-10 max-w-sm">
                  Generate illustrations that match your style. Regenerate until
                  perfect. Save prompts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6 bg-[#1C1C1C] text-[#F0EDE8]">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-2">
                <div className="w-24 h-24 bg-[#FF5722] flex items-center justify-center text-3xl font-bold">
                  SC
                </div>
              </div>
              <div className="md:col-span-10">
                <blockquote className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                  "Finally, emotion cards that don't look like clip art from
                  2005. My kids actually want to use these."
                </blockquote>
                <p className="text-sm uppercase tracking-[0.2em] opacity-50">
                  Dr. Sarah Chen — Child Psychologist
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Style presets */}
        <section className="py-24 px-6">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-5xl font-bold uppercase tracking-tight mb-12">
              Style
              <br />
              Presets
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="aspect-square bg-[#FF6B6B] p-4 flex flex-col justify-end">
                <p className="text-white font-bold uppercase text-sm">
                  Warm & Playful
                </p>
              </div>
              <div className="aspect-square bg-[#6B9080] p-4 flex flex-col justify-end">
                <p className="text-white font-bold uppercase text-sm">
                  Calm & Minimal
                </p>
              </div>
              <div className="aspect-square bg-[#7400B8] p-4 flex flex-col justify-end">
                <p className="text-white font-bold uppercase text-sm">
                  Bold & Colorful
                </p>
              </div>
              <div className="aspect-square bg-[#606C38] p-4 flex flex-col justify-end">
                <p className="text-white font-bold uppercase text-sm">
                  Nature & Earthy
                </p>
              </div>
              <div className="aspect-square bg-[#9D4EDD] p-4 flex flex-col justify-end">
                <p className="text-white font-bold uppercase text-sm">
                  Whimsical Fantasy
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid md:grid-cols-2 items-center gap-8">
              <div>
                <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6">
                  Start
                  <br />
                  Building
                  <br />
                  <span className="text-[#FF5722]">Today</span>
                </h2>
                <p className="text-xl mb-8 max-w-md">
                  14-day free trial. No credit card. Create your first deck in
                  minutes.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-4 text-lg font-bold uppercase tracking-wider bg-[#FF5722] text-white px-10 py-6 hover:bg-[#1C1C1C] transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Geometric composition */}
              <div className="relative h-[400px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFB800]" />
                <div className="absolute top-24 right-24 w-32 h-64 bg-[#1C1C1C]" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-[#4CAF50]" />
                <div className="absolute bottom-16 right-8 w-24 h-24 border-4 border-[#FF5722]" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#1C1C1C] py-8 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-bold uppercase tracking-wider">
            Resource Builder © 2025
          </p>
          <nav aria-label="Footer">
            <ul className="flex gap-6 text-sm font-bold uppercase tracking-wider">
              <li>
                <Link href="/privacy" className="hover:text-[#FF5722]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FF5722]">
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@resourcebuilder.app"
                  className="hover:text-[#FF5722]"
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
