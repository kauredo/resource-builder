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
    <div style={{ transform: `rotate(${rotation}deg)` }}>
    <article
      className="w-36 h-48 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-[translate,box-shadow] duration-700 ease-out hover:shadow-lg hover:-translate-y-3 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-sm"
      style={{ backgroundColor: color }}
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
    </div>
  );
}

// Feature icon with specific illustrations instead of generic checkmarks
function FeatureIcon({ type }: { type: "palette" | "printer" | "character" | "collection" }) {
  const config = {
    palette: { color: "text-coral", bg: "bg-coral/10" },
    printer: { color: "text-teal", bg: "bg-teal/10" },
    character: { color: "text-coral", bg: "bg-coral/10" },
    collection: { color: "text-teal", bg: "bg-teal/10" },
  };

  const icons = {
    palette: (
      <svg
        className={`size-5 ${config.palette.color}`}
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
        className={`size-5 ${config.printer.color}`}
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
        className={`size-5 ${config.character.color}`}
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
    collection: (
      <svg
        className={`size-5 ${config.collection.color}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
      </svg>
    ),
  };

  return (
    <div className={`size-11 rounded-xl ${config[type].bg} flex items-center justify-center shrink-0`}>
      {icons[type]}
    </div>
  );
}

// Resource type list item — colored left border + name + description
function ResourceTypeItem({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <li className="py-2.5">
      <span className="font-medium text-foreground">{name}</span>
      <span className="text-muted-foreground text-sm block mt-0.5">
        {description}
      </span>
    </li>
  );
}

// Template example row for starter templates section
function TemplateExample({
  type,
  name,
  detail,
  accentColor,
}: {
  type: string;
  name: string;
  detail: string;
  accentColor: string;
}) {
  return (
    <div
      className="flex items-start gap-4 px-4 py-3.5 rounded-xl border border-border/50 bg-card transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none"
      style={{ borderLeftWidth: "3px", borderLeftColor: accentColor }}
    >
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5"
        style={{
          color: accentColor,
          backgroundColor: `color-mix(in oklch, ${accentColor}, transparent 88%)`,
        }}
      >
        {type}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-sm text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
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
                  Free to start · No credit card required
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

        {/* Capability strip — visual bridge between hero and content */}
        <section
          className="py-5 border-y border-border/60 bg-secondary/30"
          aria-label="Key capabilities"
        >
          <div className="max-w-6xl mx-auto px-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground" role="list">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-coral" aria-hidden="true" />
                12 resource types
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-teal" aria-hidden="true" />
                25+ starter templates
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-coral" aria-hidden="true" />
                AI illustrations in your style
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-teal" aria-hidden="true" />
                Print-ready PDF export
              </li>
            </ul>
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
              <h2 id="how-heading">From idea to printed resource in minutes</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                No design skills needed. Pick a style, describe what you need,
                and let AI create illustrations that work beautifully together.
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
                  <h3 className="mb-3">Describe what you need</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Tell us what you&apos;re creating — emotion cards, a worksheet,
                    a board game. Pick emotions, topics, or write your own
                    content.
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
                  <h3 className="mb-3">Generate & export</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    AI creates matching illustrations for every piece. Export as
                    print-ready PDF — sized, formatted, and ready for your next
                    session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Starter templates */}
        <section
          className="py-24 px-6 bg-secondary/30"
          aria-labelledby="templates-heading"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <p className="text-sm font-medium text-coral mb-3 tracking-wide">
                  Ready-made resources
                </p>
                <h2 id="templates-heading">
                  Start with 25+ starter templates
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-lg">
                  Pre-built by clinicians, covering anxiety, social skills,
                  emotional regulation, and more. Just choose your style and
                  create — no blank canvas, no writer&apos;s block.
                </p>
              </div>

              <div className="space-y-3">
                <TemplateExample
                  type="Emotion Cards"
                  name="Anxiety Feelings Deck"
                  detail="12 cards exploring the physical and emotional signs of anxiety"
                  accentColor="oklch(65% 0.18 25)"
                />
                <TemplateExample
                  type="Worksheet"
                  name="Thought Detective Worksheet"
                  detail="CBT thought record with guided prompts for identifying cognitive distortions"
                  accentColor="oklch(55% 0.12 170)"
                />
                <TemplateExample
                  type="Card Game"
                  name="Social Skills Cards"
                  detail="Scenario-based cards for practicing conversation and empathy skills"
                  accentColor="oklch(60% 0.14 290)"
                />
                <TemplateExample
                  type="Book"
                  name="When My Worry Monster Visits"
                  detail="Illustrated social story for normalizing anxiety in young children"
                  accentColor="oklch(60% 0.13 50)"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Value props — More specific copy */}
        <section
          className="py-24 px-6"
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

                <div className="flex gap-4">
                  <FeatureIcon type="collection" />
                  <div>
                    <h3 className="text-base font-semibold mb-1.5">
                      Organize by program or session
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Group resources into collections — by therapy program,
                      client, or session plan. Export everything as a single ZIP
                      when you need it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you can create */}
        <section className="py-24 px-6 bg-secondary/30" aria-labelledby="resources-heading">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <p className="text-sm font-medium text-coral mb-3 tracking-wide">
                One consistent style
              </p>
              <h2 id="resources-heading">
                <span className="font-serif text-coral">12</span> resource types
                for creative therapy
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From feelings check-ins to full board games — all matching your
                visual style, ready to print.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Cards & Games */}
              <div
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
                style={{ borderTopWidth: "3px", borderTopColor: "oklch(65% 0.18 25)" }}
              >
                <h3 className="text-sm font-semibold text-coral tracking-wide uppercase mb-4">
                  Cards & Games
                </h3>
                <ul className="divide-y divide-border/40" role="list">
                  <ResourceTypeItem
                    name="Emotion Cards"
                    description="Illustrated cards for feelings identification"
                  />
                  <ResourceTypeItem
                    name="Flashcards"
                    description="Double-sided cards for CBT and coping strategies"
                  />
                  <ResourceTypeItem
                    name="Card Games"
                    description="Complete therapeutic card games, print-and-play"
                  />
                  <ResourceTypeItem
                    name="Board Games"
                    description="Game boards with tokens, cards, and pieces"
                  />
                </ul>
              </div>

              {/* Worksheets & Activities */}
              <div
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
                style={{ borderTopWidth: "3px", borderTopColor: "oklch(55% 0.12 170)" }}
              >
                <h3 className="text-sm font-semibold text-teal tracking-wide uppercase mb-4">
                  Worksheets & Activities
                </h3>
                <ul className="divide-y divide-border/40" role="list">
                  <ResourceTypeItem
                    name="Worksheets"
                    description="Structured therapy worksheets with illustrations"
                  />
                  <ResourceTypeItem
                    name="Behavior Charts"
                    description="Visual tracking for goals and positive behaviors"
                  />
                  <ResourceTypeItem
                    name="Visual Schedules"
                    description="Step-by-step routine and transition guides"
                  />
                  <ResourceTypeItem
                    name="Coloring Pages"
                    description="Line-art illustrations for therapeutic coloring"
                  />
                </ul>
              </div>

              {/* Creative Materials */}
              <div
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm"
                style={{ borderTopWidth: "3px", borderTopColor: "oklch(60% 0.09 50)" }}
              >
                <h3 className="text-sm font-semibold text-foreground/60 tracking-wide uppercase mb-4">
                  Creative Materials
                </h3>
                <ul className="divide-y divide-border/40" role="list">
                  <ResourceTypeItem
                    name="Posters"
                    description="Wall posters for therapy rooms and classrooms"
                  />
                  <ResourceTypeItem
                    name="Books"
                    description="Social stories and illustrated therapeutic books"
                  />
                  <ResourceTypeItem
                    name="Certificates"
                    description="Achievement and completion awards"
                  />
                  <ResourceTypeItem
                    name="Free Prompt"
                    description="Any custom illustration with full creative control"
                  />
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          className="py-24 px-6"
          aria-labelledby="pricing-heading"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-coral mb-3 tracking-wide">
                Simple pricing
              </p>
              <h2 id="pricing-heading">
                Start free, upgrade when you&apos;re ready
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                No surprises. Create your first resources at no cost.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free plan */}
              <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-semibold">$0</span>
                    <span className="text-muted-foreground text-sm">/forever</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground" role="list">
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    2 resources per month
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    3 starter templates per month
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    1 custom style + 5 presets
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    1 character
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-teal mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    All 12 resource types
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-muted-foreground/40 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <span className="text-muted-foreground/60">Exports include subtle watermark</span>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-11 cursor-pointer"
                  asChild
                >
                  <Link href="/signup">Get started free</Link>
                </Button>
              </div>

              {/* Pro plan */}
              <div className="bg-card rounded-2xl p-8 border-2 border-coral/30 shadow-sm relative">
                <div className="absolute -top-3 left-8 bg-coral text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-serif font-semibold">$15</span>
                    <span className="text-muted-foreground text-sm">/month, billed annually</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    or $19/month billed monthly
                  </p>
                </div>
                <ul className="space-y-3 mb-8 text-sm" role="list">
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <strong>Unlimited</strong>&nbsp;resources
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <strong>Unlimited</strong>&nbsp;custom styles
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <strong>Unlimited</strong>&nbsp;characters
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    <strong>Unlimited</strong>&nbsp;starter templates
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Clean, watermark-free exports
                  </li>
                  <li className="flex items-start gap-2.5">
                    <svg className="size-4 text-coral mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Priority support
                  </li>
                </ul>
                <Button
                  size="lg"
                  className="w-full h-11 btn-coral cursor-pointer"
                  asChild
                >
                  <Link href="/signup">Start creating today</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-32 px-6 relative overflow-hidden"
          aria-labelledby="cta-heading"
        >
          {/* Decorative background — bookend to hero */}
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-coral/5" />
            <div className="absolute top-1/4 right-1/3 size-48 rounded-full bg-teal/4" />
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <h2 id="cta-heading">Ready to create something beautiful?</h2>
            <p className="mt-4 text-lg text-muted-foreground mb-8">
              Your first two resources are free — no credit card required.
            </p>
            <Button size="lg" className="btn-coral h-12 px-8 text-base" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
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
