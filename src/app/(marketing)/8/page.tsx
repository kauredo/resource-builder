import Link from "next/link";

/**
 * DESIGN 8: STORYBOOK
 *
 * Aesthetic: Warm, illustrated, like a beloved children's book.
 * Soft paper-like textures, gentle warm colors, whimsical but calm.
 * For therapists working with early childhood (ages 3-8).
 *
 * Focus: Young children / Early childhood
 */

export default function StorybookPage() {
  return (
    <div
      className="min-h-screen text-[#5D4E37]"
      style={{ backgroundColor: "#FFF9F0" }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9F0]/90 backdrop-blur-sm">
        <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/8"
            className="text-lg"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Resource Builder
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm hover:text-[#C4956A] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-5 py-2 rounded-lg bg-[#C4956A] text-white hover:bg-[#B5865B] transition-colors"
            >
              Begin
            </Link>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="pt-36 pb-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl leading-tight mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Once upon a feeling...
            </h1>
            <p className="text-lg text-[#5D4E37]/70 max-w-xl mx-auto mb-10">
              Create warm, storybook-style emotion cards that help little ones
              discover the world of feelings.
            </p>

            <Link
              href="/signup"
              className="inline-block px-8 py-4 rounded-lg bg-[#C4956A] text-white hover:bg-[#B5865B] transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Start your story
            </Link>

            <p className="mt-4 text-sm text-[#5D4E37]/50">
              Free for 14 days
            </p>
          </div>
        </section>

        {/* Illustration area */}
        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-8 flex justify-center gap-6"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <div
                className="w-28 h-36 rounded-xl flex flex-col items-center justify-center p-4"
                style={{
                  backgroundColor: "#FFE5D0",
                  transform: "rotate(-5deg)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full mb-3"
                  style={{ backgroundColor: "#FFD4B8" }}
                />
                <span
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Joy
                </span>
              </div>

              <div
                className="w-28 h-36 rounded-xl flex flex-col items-center justify-center p-4"
                style={{ backgroundColor: "#D4E5D0" }}
              >
                <div
                  className="w-14 h-14 rounded-full mb-3"
                  style={{ backgroundColor: "#C4D8C0" }}
                />
                <span
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Peace
                </span>
              </div>

              <div
                className="w-28 h-36 rounded-xl flex flex-col items-center justify-center p-4"
                style={{
                  backgroundColor: "#D0E0F0",
                  transform: "rotate(4deg)",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full mb-3"
                  style={{ backgroundColor: "#B8D0E8" }}
                />
                <span
                  className="text-sm"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Tears
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Story steps */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-2xl text-center mb-12"
              style={{ fontFamily: "Georgia, serif" }}
            >
              A simple tale in three parts
            </h2>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFE5D0" }}
                >
                  <span style={{ fontFamily: "Georgia, serif" }}>1</span>
                </div>
                <div>
                  <h3
                    className="text-lg mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Choose your colors
                  </h3>
                  <p className="text-[#5D4E37]/70">
                    Pick from warm, storybook palettes or create your own gentle world.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#D4E5D0" }}
                >
                  <span style={{ fontFamily: "Georgia, serif" }}>2</span>
                </div>
                <div>
                  <h3
                    className="text-lg mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Gather your feelings
                  </h3>
                  <p className="text-[#5D4E37]/70">
                    Select emotions with names little ones understand—happy, sad, scared, brave.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#D0E0F0" }}
                >
                  <span style={{ fontFamily: "Georgia, serif" }}>3</span>
                </div>
                <div>
                  <h3
                    className="text-lg mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Bring them to life
                  </h3>
                  <p className="text-[#5D4E37]/70">
                    AI illustrates each feeling. Print, cut, and share the story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why section */}
        <section
          className="py-20 px-6"
          style={{ backgroundColor: "#F5EDE0" }}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-2xl text-center mb-12"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Why storybook style?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3
                  className="text-lg mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Familiar & safe
                </h3>
                <p className="text-[#5D4E37]/70">
                  Children know storybooks. That familiarity creates safety for exploring feelings.
                </p>
              </div>

              <div>
                <h3
                  className="text-lg mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Warm illustrations
                </h3>
                <p className="text-[#5D4E37]/70">
                  Soft, hand-drawn style that invites rather than overwhelms.
                </p>
              </div>

              <div>
                <h3
                  className="text-lg mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Consistent friends
                </h3>
                <p className="text-[#5D4E37]/70">
                  The same character guides them through every emotion, like a trusted companion.
                </p>
              </div>

              <div>
                <h3
                  className="text-lg mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Print-perfect
                </h3>
                <p className="text-[#5D4E37]/70">
                  Cards feel like pages from a book—something to hold and treasure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <blockquote
              className="text-xl leading-relaxed mb-6 text-[#5D4E37]/80"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "The storybook quality makes feelings feel like an adventure to
              explore, not something scary to confront."
            </blockquote>
            <p className="text-sm text-[#5D4E37]/50">
              Maria S. — Early Childhood Specialist
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div
            className="max-w-md mx-auto text-center rounded-2xl p-10"
            style={{ backgroundColor: "#F5EDE0" }}
          >
            <h2
              className="text-2xl mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Begin your chapter
            </h2>
            <p className="text-[#5D4E37]/70 mb-6">
              Create emotion cards that tell a gentle story.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-lg bg-[#C4956A] text-white hover:bg-[#B5865B] transition-colors"
            >
              Start free
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-[#5D4E37]/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-[#5D4E37]/50">
          <p style={{ fontFamily: "Georgia, serif" }}>
            © 2025 Resource Builder
          </p>
          <nav>
            <ul className="flex gap-6">
              <li><Link href="/privacy" className="hover:text-[#5D4E37]">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#5D4E37]">Terms</Link></li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
