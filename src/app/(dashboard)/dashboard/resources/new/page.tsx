"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  FileText,
  Grid3x3,
  CreditCard,
  PencilRuler,
  Gamepad2,
  Wand2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StarterLibrary } from "@/components/resource/starter-library/StarterLibrary";
import { useCallback } from "react";

const RESOURCE_TYPES = [
  {
    id: "emotion-cards",
    title: "Emotion Cards",
    description: "Generate a themed deck of emotion illustrations for print.",
    route: "/dashboard/resources/new/emotion-cards",
    icon: Layers,
    accent: "coral" as const,
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Front/back cards with optional images, double-sided print.",
    route: "/dashboard/resources/new/flashcards",
    icon: CreditCard,
    accent: "coral" as const,
  },
  {
    id: "poster",
    title: "Poster",
    description: "A single illustrated poster with headline text.",
    route: "/dashboard/resources/new/poster",
    icon: FileText,
    accent: "teal" as const,
  },
  {
    id: "worksheet",
    title: "Worksheet",
    description: "Structured prompts, checklists, and rating scales.",
    route: "/dashboard/resources/new/worksheet",
    icon: PencilRuler,
    accent: "teal" as const,
  },
  {
    id: "board-game",
    title: "Board Game",
    description: "Grid-based board with tokens and instruction cards.",
    route: "/dashboard/resources/new/board-game",
    icon: Grid3x3,
    accent: "neutral" as const,
  },
  {
    id: "card-game",
    title: "Card Game",
    description: "Custom deck with rules, card types, and copy counts.",
    route: "/dashboard/resources/new/card-game",
    icon: Gamepad2,
    accent: "neutral" as const,
  },
  {
    id: "book",
    title: "Book",
    description: "Illustrated books — social stories, workbooks, and narratives.",
    route: "/dashboard/resources/new/book",
    icon: BookOpen,
    accent: "coral" as const,
  },
  {
    id: "free-prompt",
    title: "Free Prompt",
    description: "Open-ended image generation from a single prompt.",
    route: "/dashboard/resources/new/free-prompt",
    icon: Wand2,
    accent: "neutral" as const,
  },
] as const;

export default function NewResourcePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const styleId = searchParams.get("styleId");
  const mode = searchParams.get("mode") === "template" ? "template" : "scratch";
  const limits = useQuery(api.users.getSubscriptionLimits);
  const user = useQuery(api.users.currentUser);
  const atLimit = limits?.subscription === "free" && !limits.canCreate.resource;

  const setMode = useCallback(
    (newMode: "scratch" | "template") => {
      const params = new URLSearchParams(searchParams.toString());
      if (newMode === "template") {
        params.set("mode", "template");
      } else {
        params.delete("mode");
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const subtitle =
    mode === "template"
      ? "Pre-built content ready to customize. Pick a style and generate images."
      : "Pick a format. You'll choose a style and add content next.";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          New resource
        </h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </header>

      {/* Segmented control */}
      <div className="mb-6">
        <div
          className="inline-flex w-full sm:w-auto rounded-lg border border-border/60 p-0.5 bg-muted/30"
          role="tablist"
          aria-label="Resource creation mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "scratch"}
            onClick={() => setMode("scratch")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-1.5 text-sm rounded-md cursor-pointer",
              "transition-all duration-150 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
              mode === "scratch"
                ? "bg-white text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Start from scratch
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "template"}
            onClick={() => setMode("template")}
            className={cn(
              "flex-1 sm:flex-none px-4 py-1.5 text-sm rounded-md cursor-pointer",
              "transition-all duration-150 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
              mode === "template"
                ? "bg-white text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Start from a template
          </button>
        </div>
      </div>

      {mode === "scratch" ? (
        <>
          {atLimit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6">
              <p className="text-sm text-amber-800 mb-3">
                You&apos;ve used your {limits.limits.resourcesPerMonth} free
                resources this month. Upgrade to Pro for unlimited resources.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-coral text-white hover:bg-coral/90 gap-1.5"
              >
                <Link href="/dashboard/settings/billing">
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          )}

          <div
            className={cn("space-y-2", atLimit && "opacity-50")}
            {...(atLimit ? { "aria-disabled": true, inert: true } : {})}
          >
            {RESOURCE_TYPES.map((type) => (
              <ResourceTypeRow key={type.id} type={type} styleId={styleId} />
            ))}
          </div>
        </>
      ) : user?._id ? (
        <StarterLibrary userId={user._id} />
      ) : (
        <TemplateLoadingSkeleton />
      )}
    </div>
  );
}

function TemplateLoadingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Filter pills skeleton */}
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-7 rounded-full bg-muted/50 animate-pulse"
            style={{ width: `${60 + i * 12}px` }}
          />
        ))}
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/40 p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-muted/50 animate-pulse" />
              <div className="h-3 w-16 rounded bg-muted/50 animate-pulse" />
            </div>
            <div className="h-4 w-3/4 rounded bg-muted/50 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-muted/40 animate-pulse" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-5 w-14 rounded-full bg-muted/40 animate-pulse" />
              <div className="h-5 w-20 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceTypeRow({
  type,
  styleId,
}: {
  type: (typeof RESOURCE_TYPES)[number];
  styleId: string | null;
}) {
  const Icon = type.icon;
  const href = styleId ? `${type.route}?styleId=${styleId}` : type.route;

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-xl px-4 py-4 -mx-1",
        "transition-colors duration-150 motion-reduce:transition-none",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      )}
    >
      <div
        className={cn(
          "size-10 rounded-lg flex items-center justify-center shrink-0",
          type.accent === "coral" &&
            "bg-[color-mix(in_oklch,var(--coral)_12%,transparent)] text-coral",
          type.accent === "teal" &&
            "bg-[color-mix(in_oklch,var(--teal)_12%,transparent)] text-teal",
          type.accent === "neutral" && "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-medium text-foreground">
          {type.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-snug">
          {type.description}
        </p>
      </div>

      <ArrowRight
        className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors duration-150 motion-reduce:transition-none shrink-0"
        aria-hidden="true"
      />
    </Link>
  );
}
