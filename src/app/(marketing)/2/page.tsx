import Link from "next/link";

/**
 * DESIGN 2: SOFT ORGANIC
 *
 * Aesthetic: Warm, nurturing, nature-inspired design with organic shapes,
 * soft gradients, and a handcrafted feel. Evokes safety and care—perfect
 * for therapy context. Inspired by wellness brands and children's book illustration.
 *
 * Memorable element: The flowing organic shapes and warm, embracing color palette
 */

export default function OrganicPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#3D3D3D] overflow-hidden">
      {/* Background organic shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <svg
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] text-[#F5E6D3] opacity-60"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <path d="M100,10 C150,10 190,50 190,100 C190,150 150,190 100,190 C50,190 10,150 10,100 C10,50 50,10 100,10 M100,30 C140,35 165,60 170,100 C175,145 145,175 100,170 C55,165 30,135 35,95 C40,55 65,25 100,30" />
        </svg>
        <svg
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] text-[#E8D5C4] opacity-40"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <ellipse cx="100" cy="100" rx="95" ry="80" />
        </svg>
      </div>

      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-full focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
            <Link
              href="/2"
              className="flex items-center gap-2 text-xl font-medium"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <svg
                className="w-8 h-8 text-[#B8860B]"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <circle cx="16" cy="16" r="14" opacity="0.2" />
                <circle cx="16" cy="16" r="8" />
              </svg>
              Resource Builder
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-full hover:bg-[#F5E6D3] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-5 py-2.5 rounded-full bg-[#B8860B] text-white hover:bg-[#9A7209] transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-40 pb-24 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Decorative element */}
            <div className="flex justify-center mb-8">
              <svg
                className="w-16 h-16 text-[#D4A574]"
                viewBox="0 0 64 64"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M32 8c12 0 24 12 24 24s-12 24-24 24S8 44 8 32 20 8 32 8" />
                <path d="M32 16c8 0 16 8 16 16s-8 16-16 16-16-8-16-16 8-16 16-16" />
                <circle cx="32" cy="32" r="6" fill="currentColor" />
              </svg>
            </div>

            <h1
              className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Nurture emotional growth
              <br />
              <span className="text-[#B8860B]">with beautiful materials</span>
            </h1>

            <p className="text-xl text-[#3D3D3D]/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create gentle, thoughtful therapy resources that help children
              explore and express their feelings. Designed with care, printed
              with love.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-[#B8860B] text-white text-lg hover:bg-[#9A7209] transition-colors shadow-lg shadow-[#B8860B]/20"
              >
                Start your free trial
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-full border-2 border-[#D4A574] text-[#8B4513] hover:bg-[#F5E6D3] transition-colors"
              >
                Learn more
              </Link>
            </div>

            <p className="mt-6 text-sm text-[#3D3D3D]/50">
              14 days free · No credit card needed
            </p>
          </div>
        </section>

        {/* Floating cards illustration */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-[400px]">
              {/* Organic blob background */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 400"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <linearGradient
                    id="blob-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#F5E6D3" />
                    <stop offset="100%" stopColor="#E8D5C4" />
                  </linearGradient>
                </defs>
                <ellipse
                  cx="400"
                  cy="200"
                  rx="350"
                  ry="180"
                  fill="url(#blob-gradient)"
                />
              </svg>

              {/* Cards */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Card 1 */}
                  <div
                    className="absolute -left-32 top-8 w-36 h-48 rounded-3xl bg-[#FFE4B5] shadow-xl flex flex-col items-center justify-center p-4"
                    style={{ transform: "rotate(-12deg)" }}
                  >
                    <div className="w-20 h-20 rounded-full bg-white/50 mb-3 flex items-center justify-center">
                      <span className="text-4xl">😊</span>
                    </div>
                    <span className="font-medium text-[#8B4513]">Happy</span>
                  </div>

                  {/* Card 2 - center */}
                  <div className="relative w-40 h-52 rounded-3xl bg-[#98D8C8] shadow-xl flex flex-col items-center justify-center p-4 z-10">
                    <div className="w-24 h-24 rounded-full bg-white/50 mb-3 flex items-center justify-center">
                      <span className="text-5xl">😌</span>
                    </div>
                    <span className="font-medium text-[#2E6B5E]">Calm</span>
                  </div>

                  {/* Card 3 */}
                  <div
                    className="absolute -right-32 top-4 w-36 h-48 rounded-3xl bg-[#DDA0DD] shadow-xl flex flex-col items-center justify-center p-4"
                    style={{ transform: "rotate(10deg)" }}
                  >
                    <div className="w-20 h-20 rounded-full bg-white/50 mb-3 flex items-center justify-center">
                      <span className="text-4xl">😢</span>
                    </div>
                    <span className="font-medium text-[#8B5A8B]">Sad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#B8860B] font-medium mb-3">How it works</p>
              <h2
                className="text-3xl md:text-4xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Simple steps to meaningful resources
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-[#FFE4B5] flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-[#B8860B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Choose your style
                </h3>
                <p className="text-[#3D3D3D]/70 leading-relaxed">
                  Select from warm presets or create your own gentle aesthetic.
                  Every element designed to feel safe and inviting.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-[#98D8C8] flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-[#2E6B5E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Pick emotions
                </h3>
                <p className="text-[#3D3D3D]/70 leading-relaxed">
                  Select from 20+ carefully named emotions. From simple feelings
                  to complex states like "overwhelmed" or "hopeful."
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-[#DDA0DD] flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-[#8B5A8B]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Print & use
                </h3>
                <p className="text-[#3D3D3D]/70 leading-relaxed">
                  AI generates matching illustrations. Export as print-ready PDF
                  with cut guides. Ready for your next session.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-6 bg-white/50">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[#B8860B] font-medium mb-3">
                  Designed for therapy
                </p>
                <h2
                  className="text-3xl md:text-4xl mb-6"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Materials that support the therapeutic relationship
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#98D8C8] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-[#2E6B5E]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">
                        Consistent characters
                      </h3>
                      <p className="text-[#3D3D3D]/70">
                        The same friendly character appears across all your
                        materials, building familiarity and trust.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFE4B5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-[#B8860B]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Print-optimized</h3>
                      <p className="text-[#3D3D3D]/70">
                        Colors calibrated for paper. Therapy happens away from
                        screens—your materials should too.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#DDA0DD] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-[#8B5A8B]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">
                        Research-backed emotions
                      </h3>
                      <p className="text-[#3D3D3D]/70">
                        Emotion categories based on developmental psychology and
                        clinical practice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative illustration */}
              <div className="relative">
                <div className="aspect-square rounded-[40px] bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] p-8 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-[280px]">
                    <div className="aspect-[3/4] rounded-2xl bg-[#FFE4B5] shadow-lg" />
                    <div className="aspect-[3/4] rounded-2xl bg-[#98D8C8] shadow-lg mt-8" />
                    <div className="aspect-[3/4] rounded-2xl bg-[#DDA0DD] shadow-lg -mt-4" />
                    <div className="aspect-[3/4] rounded-2xl bg-[#87CEEB] shadow-lg mt-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <svg
              className="w-12 h-12 mx-auto mb-8 text-[#D4A574]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
            </svg>
            <blockquote
              className="text-2xl md:text-3xl leading-relaxed mb-8 text-[#3D3D3D]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              The warmth of these materials makes a real difference. Children
              feel invited to explore their emotions rather than interrogated
              about them.
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#98D8C8] flex items-center justify-center text-[#2E6B5E] font-medium text-lg">
                MR
              </div>
              <div className="text-left">
                <p className="font-medium">Maria Rodriguez</p>
                <p className="text-sm text-[#3D3D3D]/50">Play Therapist</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4] rounded-[40px] p-12 text-center">
              <h2
                className="text-3xl md:text-4xl mb-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Ready to create with care?
              </h2>
              <p className="text-[#3D3D3D]/70 mb-8 text-lg">
                Join therapists who are making therapy materials with heart.
              </p>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 rounded-full bg-[#B8860B] text-white text-lg hover:bg-[#9A7209] transition-colors shadow-lg shadow-[#B8860B]/20"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E8D5C4]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p
            className="text-lg text-[#3D3D3D]/70"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Resource Builder
          </p>
          <nav aria-label="Footer">
            <ul className="flex gap-6 text-sm text-[#3D3D3D]/50">
              <li>
                <Link href="/privacy" className="hover:text-[#3D3D3D]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#3D3D3D]">
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@resourcebuilder.app"
                  className="hover:text-[#3D3D3D]"
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
