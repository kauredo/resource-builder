import Link from "next/link";

/**
 * DESIGN 5: LUXURY MINIMAL
 *
 * Aesthetic: High-end, refined, sophisticated. Inspired by luxury brands like
 * Aesop, Byredo, and premium SaaS products. Extreme white space, subtle details,
 * restrained color, and impeccable typography. Quiet confidence.
 *
 * Memorable element: The extreme restraint and premium feel—less is more
 */

export default function LuxuryPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#1A1A1A] focus:text-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Header - Ultra minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/5" className="text-sm tracking-[0.3em] uppercase">
            Resource Builder
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-sm tracking-wider hover:opacity-60 transition-opacity"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm tracking-wider border-b border-[#1A1A1A] pb-0.5 hover:opacity-60 transition-opacity"
            >
              Begin
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero - Extreme white space */}
        <section className="min-h-screen flex items-center justify-center px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs tracking-[0.4em] uppercase text-[#1A1A1A]/40 mb-12">
              For Therapists & Psychologists
            </p>

            <h1
              className="text-[clamp(2.5rem,6vw,5rem)] leading-[1.1] tracking-tight mb-12"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Therapy materials,
              <br />
              <em className="not-italic text-[#1A1A1A]/40">elevated.</em>
            </h1>

            <p className="text-lg text-[#1A1A1A]/60 max-w-xl mx-auto mb-16 leading-relaxed">
              Create beautiful emotion cards and visual resources for children.
              Consistent style. Print-ready. Designed with intention.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/signup"
                className="px-10 py-4 bg-[#1A1A1A] text-[#FAFAFA] text-sm tracking-wider hover:bg-[#333] transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="#philosophy"
                className="text-sm tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors flex items-center gap-2"
              >
                Learn more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
            </div>

            <p className="mt-12 text-xs text-[#1A1A1A]/30 tracking-wider">
              14 days complimentary · No card required
            </p>
          </div>
        </section>

        {/* Visual break - Single elegant card preview */}
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center">
              <div className="relative">
                {/* Shadow card */}
                <div
                  className="absolute top-4 left-4 w-48 h-64 rounded-2xl bg-[#E8E4DE]"
                  style={{ transform: "rotate(-3deg)" }}
                />
                {/* Main card */}
                <div className="relative w-48 h-64 rounded-2xl bg-white shadow-2xl shadow-black/5 flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-[#F5F3F0] mb-4" />
                  <p
                    className="text-sm tracking-wider"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Calm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy section */}
        <section id="philosophy" className="py-32 px-8 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-16">
              <div className="md:col-span-4">
                <p className="text-xs tracking-[0.3em] uppercase text-[#1A1A1A]/40 sticky top-24">
                  Our Philosophy
                </p>
              </div>
              <div className="md:col-span-8">
                <h2
                  className="text-3xl md:text-4xl leading-snug mb-8"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  The materials we use in therapy speak before we do. They set
                  the tone. They build trust.
                </h2>
                <p className="text-lg text-[#1A1A1A]/60 leading-relaxed">
                  Resource Builder exists because therapists deserve tools that
                  match the care they put into their practice. Every card, every
                  illustration, every color choice—considered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process - Minimal numbered list */}
        <section className="py-32 px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-16">
              <div className="md:col-span-4">
                <p className="text-xs tracking-[0.3em] uppercase text-[#1A1A1A]/40 sticky top-24">
                  The Process
                </p>
              </div>
              <div className="md:col-span-8">
                <div className="space-y-16">
                  <div className="flex gap-8">
                    <span className="text-xs text-[#1A1A1A]/30 pt-2">01</span>
                    <div>
                      <h3
                        className="text-xl mb-3"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Define your aesthetic
                      </h3>
                      <p className="text-[#1A1A1A]/60 leading-relaxed">
                        Select from five curated style presets or craft a custom
                        visual language. Colors, typography, illustration
                        approach—each element intentional.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="text-xs text-[#1A1A1A]/30 pt-2">02</span>
                    <div>
                      <h3
                        className="text-xl mb-3"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Curate emotions
                      </h3>
                      <p className="text-[#1A1A1A]/60 leading-relaxed">
                        Choose from 20+ research-informed emotional states. From
                        foundational feelings to nuanced experiences—build decks
                        tailored to each client.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="text-xs text-[#1A1A1A]/30 pt-2">03</span>
                    <div>
                      <h3
                        className="text-xl mb-3"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Generate & refine
                      </h3>
                      <p className="text-[#1A1A1A]/60 leading-relaxed">
                        AI creates cohesive illustrations maintaining your
                        chosen style. Review, regenerate as needed, then export
                        print-ready PDFs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Ultra minimal cards */}
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-px bg-[#E8E4DE]">
              <div className="bg-[#FAFAFA] p-12">
                <p className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A]/40 mb-6">
                  Consistency
                </p>
                <h3
                  className="text-xl mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Character persistence
                </h3>
                <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">
                  The same character appears across all materials. Familiarity
                  that builds trust with anxious children.
                </p>
              </div>

              <div className="bg-[#FAFAFA] p-12">
                <p className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A]/40 mb-6">
                  Craft
                </p>
                <h3
                  className="text-xl mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Print optimized
                </h3>
                <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">
                  Colors calibrated for paper. Cut lines precisely placed.
                  Designed for physical use, not screens.
                </p>
              </div>

              <div className="bg-[#FAFAFA] p-12">
                <p className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A]/40 mb-6">
                  Identity
                </p>
                <h3
                  className="text-xl mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Your visual system
                </h3>
                <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">
                  Unified style across every resource. Parents recognize your
                  materials. Children feel continuity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial - Single, prominent */}
        <section className="py-32 px-8 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote
              className="text-2xl md:text-3xl leading-relaxed mb-12"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "The quality speaks for itself. These materials feel considered
              in a way that generic resources never do."
            </blockquote>
            <div>
              <p className="text-sm tracking-wider">Dr. Sarah Chen</p>
              <p className="text-xs text-[#1A1A1A]/40 mt-1 tracking-wider">
                Child Psychologist, Boston
              </p>
            </div>
          </div>
        </section>

        {/* Style presets - Elegant swatches */}
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-12 gap-16 mb-16">
              <div className="md:col-span-4">
                <p className="text-xs tracking-[0.3em] uppercase text-[#1A1A1A]/40">
                  Style Presets
                </p>
              </div>
              <div className="md:col-span-8">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Five curated starting points
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[
                { name: "Warm", color: "#FF6B6B" },
                { name: "Calm", color: "#6B9080" },
                { name: "Bold", color: "#7400B8" },
                { name: "Earth", color: "#606C38" },
                { name: "Dream", color: "#9D4EDD" },
              ].map(preset => (
                <div key={preset.name} className="text-center">
                  <div
                    className="aspect-[3/4] rounded-lg mb-4"
                    style={{ backgroundColor: preset.color }}
                  />
                  <p className="text-xs tracking-wider text-[#1A1A1A]/60">
                    {preset.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA - Minimal and confident */}
        <section className="py-32 px-8 bg-[#1A1A1A] text-[#FAFAFA]">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl md:text-4xl mb-8"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Elevate your practice.
            </h2>
            <p className="text-[#FAFAFA]/60 mb-12 text-lg">
              Begin your complimentary trial today.
            </p>
            <Link
              href="/signup"
              className="inline-block px-12 py-5 border border-[#FAFAFA] text-sm tracking-wider hover:bg-[#FAFAFA] hover:text-[#1A1A1A] transition-colors"
            >
              Start Creating
            </Link>
          </div>
        </section>
      </main>

      {/* Footer - Ultra minimal */}
      <footer className="py-16 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-xs tracking-[0.2em] text-[#1A1A1A]/40">
            © 2025 Resource Builder
          </p>
          <nav aria-label="Footer">
            <ul className="flex gap-8 text-xs tracking-wider text-[#1A1A1A]/40">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#1A1A1A] transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@resourcebuilder.app"
                  className="hover:text-[#1A1A1A] transition-colors"
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
