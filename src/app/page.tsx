import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/layout/MarketingHeader";

// Emotion card component ready for real images
function EmotionCardPreview({
  emotion,
  color,
  rotation = 0,
  imageSrc,
}: {
  emotion: string;
  color: string;
  rotation?: number;
  imageSrc?: string;
}) {
  return (
    <article
      className="w-36 h-48 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1),0_8px_32px_-8px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden transition-transform duration-200 ease-out hover:scale-105 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15),0_12px_40px_-8px_rgba(0,0,0,0.1)] motion-reduce:transition-none motion-reduce:hover:scale-100"
      style={{
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
      }}
      aria-label={`${emotion} emotion card example`}
    >
      {/* Image area - ready for real illustrations */}
      <div className="flex-1 flex items-center justify-center p-3">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Illustration representing ${emotion}`}
            width={112}
            height={112}
            className="w-28 h-28 object-contain"
          />
        ) : (
          // Placeholder illustration area
          <div className="w-24 h-24 rounded-xl bg-white/25 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/35" />
          </div>
        )}
      </div>
      {/* Label - white text with shadow for contrast on any background */}
      <div className="px-3 pb-3">
        <span
          className="block text-center text-sm font-semibold tracking-wide"
          style={{
            color: "white",
            textShadow: "0 1px 2px rgba(0,0,0,0.15)",
          }}
        >
          {emotion}
        </span>
      </div>
    </article>
  );
}

// Style preset chip
function StylePreviewChip({
  name,
  colors,
}: {
  name: string;
  colors: [string, string, string];
}) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-border shadow-sm transition-default hover:shadow-md hover:border-border/80">
      <div className="flex -space-x-1.5" aria-hidden="true">
        {colors.map((color, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground/80">{name}</span>
    </div>
  );
}

// Feature icon with specific illustrations instead of generic checkmarks
function FeatureIcon({ type }: { type: "palette" | "printer" | "character" }) {
  const icons = {
    palette: (
      <svg
        className="w-5 h-5 text-coral"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
        />
      </svg>
    ),
    printer: (
      <svg
        className="w-5 h-5 text-coral"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
        />
      </svg>
    ),
    character: (
      <svg
        className="w-5 h-5 text-coral"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
        />
      </svg>
    ),
  };

  return (
    <div className="w-11 h-11 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
      {icons[type]}
    </div>
  );
}

// Testimonial component with visual variety
function Testimonial({
  quote,
  author,
  role,
  accentColor = "#FF6B6B",
  featured = false,
}: {
  quote: string;
  author: string;
  role: string;
  accentColor?: string;
  featured?: boolean;
}) {
  return (
    <figure
      className={`flex flex-col relative ${
        featured
          ? "bg-card rounded-2xl p-8 shadow-sm border border-border/50"
          : ""
      }`}
    >
      {/* Decorative quote mark */}
      <span
        className={`font-serif select-none absolute ${
          featured
            ? "-top-2 -left-1 text-7xl opacity-20"
            : "-top-3 -left-1 text-5xl opacity-15"
        }`}
        style={{ color: accentColor }}
        aria-hidden="true"
      >
        "
      </span>
      <blockquote
        className={`leading-relaxed text-foreground/90 mb-6 relative z-10 ${
          featured ? "text-xl" : "text-lg"
        }`}
      >
        {quote}
      </blockquote>
      <figcaption className="flex items-center gap-3 mt-auto">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: accentColor }}
          >
            {author
              .split(" ")
              .map(n => n[0])
              .join("")}
          </span>
        </div>
        <div>
          <p className={`font-medium ${featured ? "text-base" : "text-sm"}`}>
            {author}
          </p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-ring focus:text-foreground"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <MarketingHeader />

      <main id="main-content">
        {/* Hero — Asymmetric layout */}
        <section className="pt-32 pb-20 px-6" aria-labelledby="hero-heading">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <div className="max-w-xl">
                <p className="text-coral font-semibold mb-4 tracking-wide text-sm">
                  For therapists & psychologists
                </p>
                <h1 id="hero-heading" className="mb-6">
                  Create therapy materials your clients will{" "}
                  <em className="not-italic text-coral">love</em>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md">
                  Design beautiful emotion cards, worksheets, and games for
                  children and adolescents. AI illustrations that match your
                  style — ready to print and use in sessions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="btn-coral h-12 px-8 text-base"
                    asChild
                  >
                    <Link href="/signup">Start creating today</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 text-base transition-default"
                    asChild
                  >
                    <Link href="#how-it-works">See how it works</Link>
                  </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  14-day free trial · No credit card required
                </p>
              </div>

              {/* Right: Visual — Floating emotion cards */}
              <div
                className="relative h-[400px] lg:h-[480px]"
                aria-hidden="true"
              >
                {/* Cards arranged in a pleasing scatter */}
                <div className="absolute top-8 left-4 sm:left-8 z-10">
                  <EmotionCardPreview
                    emotion="Happy"
                    color="#FF6B6B"
                    rotation={-6}
                    imageSrc="/images/cards/happy.png"
                  />
                </div>
                <div className="absolute top-0 right-8 sm:right-16 z-20">
                  <EmotionCardPreview
                    emotion="Calm"
                    color="#6B9080"
                    rotation={4}
                    imageSrc="/images/cards/calm.png"
                  />
                </div>
                <div className="absolute bottom-16 left-16 sm:left-24 z-30">
                  <EmotionCardPreview
                    emotion="Sad"
                    color="#5390D9"
                    rotation={-3}
                    imageSrc="/images/cards/sad.png"
                  />
                </div>
                <div className="absolute bottom-8 right-4 sm:right-8 z-20">
                  <EmotionCardPreview
                    emotion="Excited"
                    color="#C77DFF"
                    rotation={8}
                    imageSrc="/images/cards/excited.png"
                  />
                </div>

                {/* Decorative shapes behind cards */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-coral/8" />
                  <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-teal/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Style presets strip */}
        <section
          className="py-8 border-y border-border bg-secondary/30"
          aria-label="Available style presets"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground mr-2">
                Start with a style:
              </span>
              <StylePreviewChip
                name="Warm & Playful"
                colors={["#FF6B6B", "#4ECDC4", "#FFE66D"]}
              />
              <StylePreviewChip
                name="Calm & Minimal"
                colors={["#6B9080", "#A4C3B2", "#CCE3DE"]}
              />
              <StylePreviewChip
                name="Bold & Colorful"
                colors={["#7400B8", "#5390D9", "#56CFE1"]}
              />
              <StylePreviewChip
                name="Nature & Earthy"
                colors={["#606C38", "#DDA15E", "#FEFAE0"]}
              />
              <StylePreviewChip
                name="Whimsical Fantasy"
                colors={["#E0AAFF", "#C77DFF", "#9D4EDD"]}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="py-24 px-6 scroll-mt-20"
          aria-labelledby="how-heading"
        >
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-16">
              <h2 id="how-heading">From idea to printed cards in minutes</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                No design skills needed. Pick a style, choose your emotions, and
                let AI create illustrations that work beautifully together.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="relative">
                <div
                  className="text-6xl font-serif text-coral/30 absolute -top-4 -left-2 select-none"
                  aria-hidden="true"
                >
                  1
                </div>
                <div className="relative pt-8">
                  <h3 className="mb-3">Choose your style</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Pick from five beautiful presets or create your own. Colors,
                    typography, illustration style — all customizable to match
                    your practice.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div
                  className="text-6xl font-serif text-coral/30 absolute -top-4 -left-2 select-none"
                  aria-hidden="true"
                >
                  2
                </div>
                <div className="relative pt-8">
                  <h3 className="mb-3">Select emotions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose from 20+ research-backed emotions or add your own.
                    From primary feelings to nuanced states like "overwhelmed"
                    or "hopeful."
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div
                  className="text-6xl font-serif text-coral/30 absolute -top-4 -left-2 select-none"
                  aria-hidden="true"
                >
                  3
                </div>
                <div className="relative pt-8">
                  <h3 className="mb-3">Generate & print</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI creates matching illustrations for each card. Export as
                    print-ready PDF with cut lines. Print, cut, and use in your
                    next session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value props — More specific copy */}
        <section
          className="py-24 px-6 bg-secondary/30"
          aria-labelledby="benefits-heading"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 id="benefits-heading">
                  Built for how therapy actually works
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-lg">
                  Sessions happen away from screens. Your materials need to be
                  physical, consistent, and beautiful enough to engage young
                  clients.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <FeatureIcon type="palette" />
                  <div>
                    <h3 className="text-base font-semibold mb-1.5">
                      Same friendly character, every session
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Create a character once, and they appear consistently
                      across all your cards and materials. Build familiarity
                      that helps anxious kids feel safe.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <FeatureIcon type="printer" />
                  <div>
                    <h3 className="text-base font-semibold mb-1.5">
                      Designed for your printer, not your screen
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Colors optimized for paper. Cut lines where you need them.
                      Card sizes that fit standard sleeves and tiny hands.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <FeatureIcon type="character" />
                  <div>
                    <h3 className="text-base font-semibold mb-1.5">
                      Your brand, everywhere
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Everything you create shares your visual style. Parents
                      recognize your materials. Kids feel the continuity between
                      sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 px-6" aria-labelledby="testimonials-heading">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-sm font-medium text-coral mb-3 tracking-wide">
              Trusted by therapists
            </p>
            <h2 id="testimonials-heading" className="text-center mb-16">
              Join 500+ mental health professionals
            </h2>

            {/* Featured testimonial layout: 1 large center, 2 smaller sides */}
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left testimonial */}
              <div className="lg:col-span-4 lg:pt-12">
                <Testimonial
                  quote="Finally, emotion cards that don't look like clip art from 2005. My kids actually want to use these."
                  author="Dr. Sarah Chen"
                  role="Child Psychologist"
                  accentColor="#FF6B6B"
                />
              </div>

              {/* Featured center testimonial */}
              <div className="lg:col-span-4">
                <Testimonial
                  quote="The consistency is everything. Same character, same style, across worksheets and cards. It builds trust with anxious kids."
                  author="Maria Rodriguez"
                  role="Play Therapist"
                  accentColor="#6B9080"
                  featured
                />
              </div>

              {/* Right testimonial */}
              <div className="lg:col-span-4 lg:pt-12">
                <Testimonial
                  quote="I used to spend hours in Canva. Now I have custom materials in minutes that actually look professional."
                  author="James Thompson"
                  role="School Counselor"
                  accentColor="#7400B8"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-24 px-6 bg-secondary/30"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 id="cta-heading">Ready to create something beautiful?</h2>
            <p className="mt-4 text-lg text-muted-foreground mb-8">
              Start your free trial today. Create your first deck in minutes.
            </p>
            <Button size="lg" className="btn-coral h-12 px-8 text-base" asChild>
              <Link href="/signup">Start creating — it&apos;s free</Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 safe-area-inset-bottom">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Resource Builder
          </p>
          <nav aria-label="Footer navigation">
            <ul className="flex gap-1 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-default px-3 py-2 rounded-md inline-block"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-default px-3 py-2 rounded-md inline-block"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:hello@resourcebuilder.app"
                  className="hover:text-foreground transition-default px-3 py-2 rounded-md inline-block"
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
