"use client";

import Link from "next/link";
import { ArrowRight, Layers, FileText, Grid3x3, CreditCard, PencilRuler, Gamepad2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RESOURCE_OPTIONS = [
  {
    id: "emotion-cards",
    title: "Emotion Cards",
    description:
      "Pick emotions, generate a cohesive deck, and export print-ready cards.",
    route: "/dashboard/resources/new/emotion-cards",
    badge: "Core flow",
    tone: "coral",
    featured: true,
    icon: Layers,
  },
  {
    id: "poster",
    title: "Poster",
    description: "Single image with headline and optional subtext.",
    route: "/dashboard/resources/new/poster",
    badge: "Print-first",
    tone: "teal",
    icon: FileText,
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Front/back text with optional image per card.",
    route: "/dashboard/resources/new/flashcards",
    badge: "Double-sided",
    tone: "teal",
    icon: CreditCard,
  },
  {
    id: "worksheet",
    title: "Worksheet",
    description: "Structured prompts, checklists, and scales.",
    route: "/dashboard/resources/new/worksheet",
    badge: "Guided form",
    tone: "coral",
    icon: PencilRuler,
  },
  {
    id: "board-game",
    title: "Board Game",
    description: "Grid board with optional tokens and cards.",
    route: "/dashboard/resources/new/board-game",
    badge: "Heavier build",
    tone: "slate",
    icon: Grid3x3,
  },
  {
    id: "card-game",
    title: "Card Game",
    description: "Make a deck and write the rules for play.",
    route: "/dashboard/resources/new/card-game",
    badge: "New",
    tone: "slate",
    icon: Gamepad2,
  },
  {
    id: "free-prompt",
    title: "Free Prompt",
    description: "Open-ended prompt for a single custom asset.",
    route: "/dashboard/resources/new/free-prompt",
    badge: "Flexible",
    tone: "teal",
    icon: Wand2,
  },
];

export default function NewResourcePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage:
            "radial-gradient(circle at 14% 8%, color-mix(in oklch, var(--coral) 14%, transparent), transparent 55%), radial-gradient(circle at 90% 18%, color-mix(in oklch, var(--teal) 12%, transparent), transparent 50%), radial-gradient(circle at 70% 85%, color-mix(in oklch, var(--foreground) 4%, transparent), transparent 55%)",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Resource Builder
          </p>
          <div className="flex flex-col gap-3 mt-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight">
              Choose a format to start
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Each format is print-ready, style-aware, and designed for quick
              iteration. Start with a guided template or keep it minimal with a
              neutral style.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8">
          <section className="space-y-6">
            {RESOURCE_OPTIONS.filter((option) => option.featured).map((option) => (
              <ResourceOption key={option.id} option={option} featured />
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RESOURCE_OPTIONS.filter((option) => !option.featured).map((option) => (
                <ResourceOption key={option.id} option={option} />
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-[color-mix(in_oklch,var(--card)_92%,var(--background)_8%)] p-6">
              <h2 className="text-sm font-medium text-foreground">How it works</h2>
              <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                <li>1. Pick a format and name your resource.</li>
                <li>2. Choose a visual style or go neutral.</li>
                <li>3. Generate assets and export PDFs.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h2 className="text-sm font-medium text-foreground">New in this release</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Version history, in-app edits, and quick re-generation let you refine
                any asset without restarting.
              </p>
              <Button asChild variant="outline" className="mt-4 gap-2">
                <Link href="/dashboard/resources">
                  View library
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ResourceOption({
  option,
  featured = false,
}: {
  option: (typeof RESOURCE_OPTIONS)[number];
  featured?: boolean;
}) {
  const Icon = option.icon;
  return (
    <Link
      href={option.route}
      className={cn(
        "group block rounded-2xl border border-border/60 bg-card p-6 transition-[transform,border-color,background-color] duration-200 ease-out motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-[color-mix(in_oklch,var(--card)_96%,var(--background)_4%)]",
        "motion-reduce:transform-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
        featured && "relative overflow-hidden",
      )}
    >
      {featured && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-[color-mix(in_oklch,var(--coral)_18%,transparent)]" />
          <div className="absolute -bottom-16 -left-10 size-48 rounded-full bg-[color-mix(in_oklch,var(--teal)_16%,transparent)]" />
        </div>
      )}

      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "size-12 rounded-xl flex items-center justify-center",
            option.tone === "coral" && "bg-[color-mix(in_oklch,var(--coral)_14%,transparent)] text-coral",
            option.tone === "teal" && "bg-[color-mix(in_oklch,var(--teal)_14%,transparent)] text-teal",
            option.tone === "slate" && "bg-muted text-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground text-lg">
              {option.title}
            </h3>
            <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border border-border/60 bg-background/80 text-muted-foreground">
              {option.badge}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {option.description}
          </p>
        </div>
        <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors duration-150 motion-reduce:transition-none" aria-hidden="true" />
      </div>
    </Link>
  );
}
