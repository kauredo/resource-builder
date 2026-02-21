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
      className="w-36 h-48 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 ease-out hover:scale-105 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:scale-100"
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
            className="size-28 object-contain"
          />
        ) : (
          // Placeholder illustration area
          <div className="size-24 rounded-xl bg-white/25 flex items-center justify-center">
            <div className="size-16 rounded-full bg-white/35" />
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
            className="size-4 rounded-full border-2 border-white shadow-sm"
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
        className="size-5 text-coral"
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
        className="size-5 text-coral"
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
        className="size-5 text-coral"
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
    <div className="size-11 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
      {icons[type]}
    </div>
  );
}

// Resource type card for "What you can create"
function ResourceTypeCard({
  title,
  description,
  color,
  icon,
}: {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col gap-4">
      <div
        className="size-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `color-mix(in oklch, ${color}, transparent 85%)` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-coral focus-visible:text-foreground"
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
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-coral/8" />
                  <div className="absolute top-1/4 right-1/4 size-32 rounded-full bg-teal/5" />
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
                    From primary feelings to nuanced states like &ldquo;overwhelmed&rdquo;
                    or &ldquo;hopeful.&rdquo;
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

        {/* What you can create */}
        <section className="py-24 px-6" aria-labelledby="resources-heading">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <p className="text-sm font-medium text-coral mb-3 tracking-wide">
                More than emotion cards
              </p>
              <h2 id="resources-heading">
                Everything you need for creative therapy
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From feelings check-ins to full board games — all matching your
                visual style, ready to print.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceTypeCard
                title="Emotion Cards"
                description="Beautiful illustrated cards for feelings identification. Print, cut, and use in sessions."
                color="#FF6B6B"
                icon={
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                }
              />
              <ResourceTypeCard
                title="Board Games"
                description="Therapeutic board games with custom tokens, cards, and game boards. Complete print-and-play sets."
                color="#6B9080"
                icon={
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                }
              />
              <ResourceTypeCard
                title="Flashcards"
                description="Double-sided flashcards for CBT exercises, coping strategies, and psychoeducation."
                color="#5390D9"
                icon={
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                  </svg>
                }
              />
              <ResourceTypeCard
                title="Worksheets"
                description="Structured therapy worksheets with your illustrations. Great for homework assignments."
                color="#C77DFF"
                icon={
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
              />
              <ResourceTypeCard
                title="Posters"
                description="Wall posters for therapy rooms — feelings wheels, coping toolkits, and regulation guides."
                color="#DDA15E"
                icon={
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                }
              />
              <ResourceTypeCard
                title="Card Games"
                description="Complete therapeutic card games with custom icons, labels, and game rules. Print-and-play ready."
                color="#606C38"
                icon={
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                }
              />
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
                  className="hover:text-foreground transition-default px-3 py-2 rounded-md inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-default px-3 py-2 rounded-md inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:support@resourcebuilder.app"
                  className="hover:text-foreground transition-default px-3 py-2 rounded-md inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
