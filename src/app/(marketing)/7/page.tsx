import Link from "next/link";

/**
 * DESIGN 7: TEEN MODERN
 *
 * Aesthetic: Clean, contemporary, slightly cool. Designed for therapists
 * working with teenagers (13-18). Respects their maturity without being
 * clinical. Muted tones, clean lines, modern feel.
 *
 * Focus: Teenagers
 */

export default function TeenModernPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#2D2D2D]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#2D2D2D] focus:text-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F5F5]/90 backdrop-blur-sm border-b border-[#2D2D2D]/5">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/7" className="text-sm font-medium tracking-wide">
            Resource Builder
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 bg-[#2D2D2D] text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-[#2D2D2D]/50 mb-4">For adolescent therapy</p>
            <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6">
              Resources that
              <br />
              actually resonate
            </h1>
            <p className="text-lg text-[#2D2D2D]/60 max-w-lg mb-10">
              Create emotion cards and therapy materials designed for teens.
              Clean aesthetics. No childish vibes.
            </p>

            <div className="flex gap-4">
              <Link
                href="/signup"
                className="px-6 py-3 bg-[#2D2D2D] text-white text-sm hover:bg-[#1A1A1A] transition-colors"
              >
                Start free trial
              </Link>
              <Link
                href="#how"
                className="px-6 py-3 text-sm text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>
        </section>

        {/* Card preview - minimal */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 justify-center">
              <div className="w-32 h-44 bg-[#E8E8E8] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#D0D0D0] rounded-full mb-3" />
                <span className="text-xs text-[#2D2D2D]/60">Anxious</span>
              </div>
              <div className="w-32 h-44 bg-[#2D2D2D] flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full mb-3" />
                <span className="text-xs text-white/60">Overwhelmed</span>
              </div>
              <div className="w-32 h-44 bg-[#E8E8E8] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#D0D0D0] rounded-full mb-3" />
                <span className="text-xs text-[#2D2D2D]/60">Hopeful</span>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-24 px-6 scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium mb-12">How it works</h2>

            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <p className="text-sm text-[#2D2D2D]/40 mb-2">01</p>
                <h3 className="font-medium mb-2">Pick a style</h3>
                <p className="text-sm text-[#2D2D2D]/60">
                  Choose from clean presets or build your own. No cartoon characters required.
                </p>
              </div>

              <div>
                <p className="text-sm text-[#2D2D2D]/40 mb-2">02</p>
                <h3 className="font-medium mb-2">Select emotions</h3>
                <p className="text-sm text-[#2D2D2D]/60">
                  20+ emotions including nuanced states teens actually experience.
                </p>
              </div>

              <div>
                <p className="text-sm text-[#2D2D2D]/40 mb-2">03</p>
                <h3 className="font-medium mb-2">Generate & print</h3>
                <p className="text-sm text-[#2D2D2D]/60">
                  AI creates matching visuals. Export print-ready PDFs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6 bg-[#2D2D2D] text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-medium mb-12">
              Designed for adolescent work
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border border-white/10">
                <h3 className="font-medium mb-2">Age-appropriate aesthetics</h3>
                <p className="text-sm text-white/60">
                  Clean, modern visuals that respect teen sensibilities.
                  No baby-ish designs that create resistance.
                </p>
              </div>

              <div className="p-6 border border-white/10">
                <h3 className="font-medium mb-2">Nuanced emotions</h3>
                <p className="text-sm text-white/60">
                  Beyond basic feelings. Includes overwhelmed, frustrated,
                  conflicted, and other complex states.
                </p>
              </div>

              <div className="p-6 border border-white/10">
                <h3 className="font-medium mb-2">Consistent branding</h3>
                <p className="text-sm text-white/60">
                  Your style across all materials. Builds professional
                  credibility with skeptical teens.
                </p>
              </div>

              <div className="p-6 border border-white/10">
                <h3 className="font-medium mb-2">Print-optimized</h3>
                <p className="text-sm text-white/60">
                  Physical materials for offline sessions. Screens stay
                  in pockets where they belong.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <blockquote className="text-xl leading-relaxed text-[#2D2D2D]/80 mb-6">
              "My teen clients actually engage with these. The clean design
              doesn't feel condescending—it feels like something made for them."
            </blockquote>
            <p className="text-sm text-[#2D2D2D]/50">
              James T. — Adolescent Therapist
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-medium mb-4">
              Ready to create?
            </h2>
            <p className="text-[#2D2D2D]/60 mb-8">
              14-day free trial. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-[#2D2D2D] text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-[#2D2D2D]/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-[#2D2D2D]/40">
          <p>© 2025 Resource Builder</p>
          <nav>
            <ul className="flex gap-6">
              <li><Link href="/privacy" className="hover:text-[#2D2D2D]">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#2D2D2D]">Terms</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
