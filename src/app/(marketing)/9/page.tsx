import Link from "next/link";

/**
 * DESIGN 9: TEEN MINIMAL
 *
 * Aesthetic: Ultra-clean, sophisticated, monochromatic with a single
 * accent color. Speaks to older adolescents (15-18) who appreciate
 * minimalism and don't want to be treated like children.
 *
 * Focus: Older teens
 */

export default function TeenMinimalPage() {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#111] focus:text-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
        <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between border-b border-[#111]/5">
          <Link href="/9" className="text-sm tracking-widest uppercase">
            RB
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-xs tracking-wider text-[#111]/50 hover:text-[#111] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-xs tracking-wider text-[#5B8C5A] hover:text-[#4A7349] transition-colors"
            >
              Start →
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-32 pb-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-light leading-snug mb-6">
              Therapy resources
              <br />
              <span className="text-[#5B8C5A]">without the cringe.</span>
            </h1>
            <p className="text-[#111]/50 max-w-md mb-10">
              Create clean, minimal emotion cards for teen clients.
              No cartoon animals. No baby colors.
            </p>

            <Link
              href="/signup"
              className="inline-block text-sm tracking-wider border-b border-[#111] pb-1 hover:text-[#5B8C5A] hover:border-[#5B8C5A] transition-colors"
            >
              Try free for 14 days
            </Link>
          </div>
        </section>

        {/* Minimal cards */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 justify-center">
              <div className="w-24 h-32 border border-[#111]/10 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-[#111]/20 mb-2" />
                <span className="text-[10px] tracking-wider text-[#111]/40 uppercase">Anxious</span>
              </div>
              <div className="w-24 h-32 bg-[#5B8C5A] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 rounded-full border border-white/30 mb-2" />
                <span className="text-[10px] tracking-wider text-white/70 uppercase">Calm</span>
              </div>
              <div className="w-24 h-32 border border-[#111]/10 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-[#111]/20 mb-2" />
                <span className="text-[10px] tracking-wider text-[#111]/40 uppercase">Numb</span>
              </div>
              <div className="w-24 h-32 bg-[#111] flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 rounded-full border border-white/20 mb-2" />
                <span className="text-[10px] tracking-wider text-white/50 uppercase">Angry</span>
              </div>
            </div>
          </div>
        </section>

        {/* How */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-16">
              <div>
                <p className="text-[10px] tracking-widest text-[#5B8C5A] mb-3">01</p>
                <p className="text-sm text-[#111]/70">
                  Pick a minimal style or go custom. Your aesthetic, not ours.
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest text-[#5B8C5A] mb-3">02</p>
                <p className="text-sm text-[#111]/70">
                  Choose real emotions. Overwhelmed. Disconnected. Not just "sad."
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest text-[#5B8C5A] mb-3">03</p>
                <p className="text-sm text-[#111]/70">
                  Generate clean illustrations. Print. Use in sessions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6 bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] tracking-widest text-[#111]/30 mb-8 uppercase">
              Why it works with teens
            </p>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-1 bg-[#5B8C5A]" />
                <div>
                  <p className="font-medium mb-1">Respects their maturity</p>
                  <p className="text-sm text-[#111]/50">
                    Clean design that doesn't patronize. Teens notice when things are "for babies."
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-1 bg-[#5B8C5A]" />
                <div>
                  <p className="font-medium mb-1">Complex emotions included</p>
                  <p className="text-sm text-[#111]/50">
                    Numbness. Disconnection. Burnout. The feelings teens actually experience.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-1 bg-[#5B8C5A]" />
                <div>
                  <p className="font-medium mb-1">Physical materials</p>
                  <p className="text-sm text-[#111]/50">
                    Printed cards they can hold. A break from screens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <blockquote className="text-lg text-[#111]/70 mb-6">
              "The minimal design actually gets buy-in from my older clients.
              They don't roll their eyes at these."
            </blockquote>
            <p className="text-xs tracking-wider text-[#111]/30 uppercase">
              — Adolescent Therapist
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-2xl font-light mb-8">
              Resources that don't try too hard.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-[#111] text-white text-sm tracking-wider hover:bg-[#5B8C5A] transition-colors"
            >
              Start free
            </Link>
            <p className="mt-4 text-xs text-[#111]/30">
              14 days · No card required
            </p>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-[#111]/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-[#111]/30">
          <p>© 2025</p>
          <nav>
            <ul className="flex gap-6">
              <li><Link href="/privacy" className="hover:text-[#111]">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#111]">Terms</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
