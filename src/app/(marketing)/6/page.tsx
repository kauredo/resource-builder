import Link from "next/link";

/**
 * DESIGN 6: GENTLE CHILDREN'S
 *
 * Aesthetic: Soft, rounded, calming pastels. Designed for therapists
 * working with younger children (ages 5-10). Friendly without being
 * overwhelming. Simple shapes, lots of breathing room.
 *
 * Focus: Young children
 */

export default function GentleChildPage() {
  return (
    <div className="min-h-screen bg-[#FEF9F3] text-[#4A4A4A]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-full"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FEF9F3]/90 backdrop-blur-sm">
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/6" className="flex items-center gap-2 text-lg font-medium">
            <div className="w-8 h-8 rounded-full bg-[#B8D4E3]" />
            Resource Builder
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm hover:text-[#7BA7BC] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-5 py-2 rounded-full bg-[#B8D4E3] hover:bg-[#9FC5D9] transition-colors"
            >
              Start free
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#F4D1D1]" />
              <div className="w-12 h-12 rounded-full bg-[#D4E8D1]" />
              <div className="w-12 h-12 rounded-full bg-[#B8D4E3]" />
            </div>

            <h1 className="text-4xl md:text-5xl font-medium leading-tight mb-6">
              Gentle tools for
              <br />
              little hearts
            </h1>

            <p className="text-lg text-[#4A4A4A]/70 max-w-xl mx-auto mb-10">
              Create soft, friendly emotion cards that help young children
              explore and express their feelings safely.
            </p>

            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-full bg-[#B8D4E3] text-[#4A4A4A] font-medium hover:bg-[#9FC5D9] transition-colors"
            >
              Try it free
            </Link>

            <p className="mt-4 text-sm text-[#4A4A4A]/50">
              14 days free · No credit card
            </p>
          </div>
        </section>

        {/* Simple card preview */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto flex justify-center gap-4">
            <div className="w-28 h-36 rounded-2xl bg-[#F4D1D1] flex flex-col items-center justify-center p-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-white/50 mb-2" />
              <span className="text-sm font-medium">Happy</span>
            </div>
            <div className="w-28 h-36 rounded-2xl bg-[#D4E8D1] flex flex-col items-center justify-center p-3 shadow-sm -mt-4">
              <div className="w-14 h-14 rounded-full bg-white/50 mb-2" />
              <span className="text-sm font-medium">Calm</span>
            </div>
            <div className="w-28 h-36 rounded-2xl bg-[#B8D4E3] flex flex-col items-center justify-center p-3 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-white/50 mb-2" />
              <span className="text-sm font-medium">Sad</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-medium text-center mb-12">
              Simple steps
            </h2>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-[#F4D1D1] mx-auto mb-4 flex items-center justify-center text-2xl font-medium text-[#4A4A4A]/50">
                  1
                </div>
                <h3 className="font-medium mb-2">Choose colors</h3>
                <p className="text-sm text-[#4A4A4A]/60">
                  Pick soft, friendly colors that feel safe
                </p>
              </div>

              <div>
                <div className="w-16 h-16 rounded-full bg-[#D4E8D1] mx-auto mb-4 flex items-center justify-center text-2xl font-medium text-[#4A4A4A]/50">
                  2
                </div>
                <h3 className="font-medium mb-2">Select feelings</h3>
                <p className="text-sm text-[#4A4A4A]/60">
                  Choose emotions right for your little ones
                </p>
              </div>

              <div>
                <div className="w-16 h-16 rounded-full bg-[#B8D4E3] mx-auto mb-4 flex items-center justify-center text-2xl font-medium text-[#4A4A4A]/50">
                  3
                </div>
                <h3 className="font-medium mb-2">Print & use</h3>
                <p className="text-sm text-[#4A4A4A]/60">
                  Get beautiful cards ready for sessions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-6 bg-white/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-medium text-center mb-12">
              Made for young minds
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#F4D1D1] flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Soft, friendly illustrations</h3>
                  <p className="text-sm text-[#4A4A4A]/60">
                    Gentle visuals that don't overwhelm sensitive children
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#D4E8D1] flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Consistent characters</h3>
                  <p className="text-sm text-[#4A4A4A]/60">
                    Same friend appears everywhere, building trust
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#B8D4E3] flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Print-ready</h3>
                  <p className="text-sm text-[#4A4A4A]/60">
                    Cards sized for small hands with easy-to-read labels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xl leading-relaxed mb-6 text-[#4A4A4A]/80">
              "The gentle colors and simple designs are perfect for my youngest
              clients. They feel safe exploring big feelings."
            </p>
            <p className="text-sm text-[#4A4A4A]/50">
              Maria R. — Play Therapist
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-md mx-auto text-center bg-[#B8D4E3]/30 rounded-3xl p-10">
            <h2 className="text-2xl font-medium mb-4">Start creating</h2>
            <p className="text-[#4A4A4A]/60 mb-6">
              Beautiful resources for your youngest clients
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-full bg-[#B8D4E3] hover:bg-[#9FC5D9] transition-colors"
            >
              Try free for 14 days
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-[#4A4A4A]/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-[#4A4A4A]/50">
          <p>© 2025 Resource Builder</p>
          <nav>
            <ul className="flex gap-6">
              <li><Link href="/privacy" className="hover:text-[#4A4A4A]">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#4A4A4A]">Terms</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
