import Link from "next/link";

/**
 * DESIGN 10: SOFT & SIMPLE (Universal)
 *
 * Aesthetic: The calmest, most restrained design. Barely-there colors,
 * extreme simplicity, zen-like quality. Works across all ages.
 * Maximum white space, minimum elements. Quiet and peaceful.
 *
 * Focus: Universal / All ages
 */

export default function SoftSimplePage() {
  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#444]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#444] focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Header - barely there */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FDFDFC]/80 backdrop-blur-sm">
        <nav className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/10" className="text-sm text-[#444]/70">
            Resource Builder
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-[#444]/40 hover:text-[#444] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm text-[#444]/70 hover:text-[#444] transition-colors"
            >
              Begin
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero - maximum calm */}
        <section className="pt-40 pb-32 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-light leading-relaxed mb-8 text-[#444]/80">
              Simple tools for
              <br />
              understanding feelings.
            </h1>
            <p className="text-[#444]/50 mb-12 max-w-md mx-auto">
              Create gentle emotion cards for therapy sessions.
              Calm design. Easy to use.
            </p>

            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-full bg-[#E8E6E3] text-[#444]/70 text-sm hover:bg-[#DDD] transition-colors"
            >
              Try free
            </Link>
          </div>
        </section>

        {/* Cards - soft and simple */}
        <section className="py-16 px-6">
          <div className="max-w-xl mx-auto flex justify-center gap-6">
            <div className="w-20 h-28 rounded-lg bg-[#F5F3F0] flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#E8E6E3] mb-2" />
              <span className="text-xs text-[#444]/40">Happy</span>
            </div>
            <div className="w-20 h-28 rounded-lg bg-[#F0F3F5] flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#E3E8ED] mb-2" />
              <span className="text-xs text-[#444]/40">Calm</span>
            </div>
            <div className="w-20 h-28 rounded-lg bg-[#F5F0F3] flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#EDE3E8] mb-2" />
              <span className="text-xs text-[#444]/40">Sad</span>
            </div>
          </div>
        </section>

        {/* How it works - minimal */}
        <section className="py-24 px-6">
          <div className="max-w-xl mx-auto">
            <p className="text-center text-sm text-[#444]/30 mb-12">
              Three simple steps
            </p>

            <div className="space-y-12 text-center">
              <div>
                <p className="text-sm text-[#444]/60 mb-1">Choose colors</p>
                <p className="text-xs text-[#444]/30">
                  Soft palettes that feel calm
                </p>
              </div>

              <div>
                <p className="text-sm text-[#444]/60 mb-1">Pick emotions</p>
                <p className="text-xs text-[#444]/30">
                  Simple words children understand
                </p>
              </div>

              <div>
                <p className="text-sm text-[#444]/60 mb-1">Print cards</p>
                <p className="text-xs text-[#444]/30">
                  Ready for your sessions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-6 bg-[#F9F8F7]">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm text-[#444]/30 mb-8">Why simple works</p>

            <div className="space-y-6 text-sm text-[#444]/50">
              <p>Calm visuals don't overwhelm</p>
              <p>Same character builds trust</p>
              <p>Printed cards for screen-free sessions</p>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-lg text-[#444]/60 leading-relaxed mb-6">
              "The simplicity is the point. Nothing distracts from the feelings work."
            </p>
            <p className="text-xs text-[#444]/30">
              Child Therapist
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-sm mx-auto text-center">
            <p className="text-lg text-[#444]/60 mb-8">
              Start creating.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-full bg-[#E8E6E3] text-[#444]/70 text-sm hover:bg-[#DDD] transition-colors"
            >
              Free for 14 days
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-[#444]/20">
          <p>© 2025</p>
          <nav>
            <ul className="flex gap-6">
              <li><Link href="/privacy" className="hover:text-[#444]/50">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#444]/50">Terms</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
