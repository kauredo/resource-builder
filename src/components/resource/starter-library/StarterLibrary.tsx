"use client";

import { useState, useMemo } from "react";
import {
  Layers,
  CreditCard,
  FileText,
  PencilRuler,
  Grid3x3,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STARTER_TEMPLATES,
  STARTER_THEMES,
  THEME_LABELS,
  RESOURCE_TYPE_LABELS,
  type StarterTemplate,
  type StarterTheme,
} from "@/lib/starter-templates";
import type { ResourceType } from "@/types";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import type { Id } from "../../../../convex/_generated/dataModel";

const TYPE_META: Record<
  Exclude<ResourceType, "free_prompt">,
  { icon: typeof Layers; accent: string }
> = {
  emotion_cards: { icon: Layers, accent: "coral" },
  flashcards: { icon: CreditCard, accent: "coral" },
  poster: { icon: FileText, accent: "teal" },
  worksheet: { icon: PencilRuler, accent: "teal" },
  board_game: { icon: Grid3x3, accent: "neutral" },
  card_game: { icon: Gamepad2, accent: "neutral" },
  book: { icon: BookOpen, accent: "coral" },
};

interface StarterLibraryProps {
  userId: Id<"users">;
}

export function StarterLibrary({ userId }: StarterLibraryProps) {
  const [themeFilter, setThemeFilter] = useState<StarterTheme | null>(null);
  const [typeFilter, setTypeFilter] = useState<ResourceType | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<StarterTemplate | null>(null);

  const filtered = useMemo(() => {
    let templates = STARTER_TEMPLATES;
    if (themeFilter) {
      templates = templates.filter((t) => t.theme === themeFilter);
    }
    if (typeFilter) {
      templates = templates.filter((t) => t.type === typeFilter);
    }
    return templates;
  }, [themeFilter, typeFilter]);

  // Available types in current filtered set (for type pills)
  const availableTypes = useMemo(() => {
    const base = themeFilter
      ? STARTER_TEMPLATES.filter((t) => t.theme === themeFilter)
      : STARTER_TEMPLATES;
    return [...new Set(base.map((t) => t.type))].filter(
      (t) => t !== "free_prompt"
    ) as Exclude<ResourceType, "free_prompt">[];
  }, [themeFilter]);

  return (
    <div className="space-y-5">
      {/* Theme filter pills */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by theme">
        <FilterPill
          label="All"
          active={themeFilter === null}
          onClick={() => {
            setThemeFilter(null);
            setTypeFilter(null);
          }}
        />
        {STARTER_THEMES.map((theme) => (
          <FilterPill
            key={theme}
            label={THEME_LABELS[theme]}
            active={themeFilter === theme}
            onClick={() => {
              setThemeFilter(themeFilter === theme ? null : theme);
              setTypeFilter(null);
            }}
          />
        ))}
      </div>

      {/* Type filter pills — only show when a theme is selected */}
      {themeFilter && availableTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
          <FilterPill
            label="All types"
            active={typeFilter === null}
            onClick={() => setTypeFilter(null)}
            small
          />
          {availableTypes.map((type) => (
            <FilterPill
              key={type}
              label={RESOURCE_TYPE_LABELS[type]}
              active={typeFilter === type}
              onClick={() =>
                setTypeFilter(typeFilter === type ? null : type)
              }
              small
            />
          ))}
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => setSelectedTemplate(template)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">
            No templates match this filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setThemeFilter(null);
              setTypeFilter(null);
            }}
            className={cn(
              "text-sm text-coral hover:text-coral/80 mt-2 cursor-pointer",
              "transition-colors duration-150 motion-reduce:transition-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded"
            )}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Preview dialog */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        userId={userId}
      />
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  small,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full cursor-pointer",
        "transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
        small ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        active
          ? "bg-[color-mix(in_oklch,var(--coral)_12%,transparent)] text-coral font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  );
}

function accentBorderClass(accent: string) {
  if (accent === "coral") return "border-l-coral";
  if (accent === "teal") return "border-l-teal";
  return "border-l-muted-foreground/30";
}

function TemplateCard({
  template,
  onClick,
}: {
  template: StarterTemplate;
  onClick: () => void;
}) {
  const meta =
    TYPE_META[template.type as Exclude<ResourceType, "free_prompt">];
  if (!meta) return null;

  const Icon = meta.icon;
  const label = RESOURCE_TYPE_LABELS[template.type as Exclude<ResourceType, "free_prompt">];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 text-left",
        "border-l-[3px]",
        accentBorderClass(meta.accent),
        "hover:border-border hover:shadow-sm",
        "transition-all duration-150 motion-reduce:transition-none cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
      )}
    >
      {/* Type badge */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "size-7 rounded-md flex items-center justify-center",
            meta.accent === "coral" &&
              "bg-[color-mix(in_oklch,var(--coral)_12%,transparent)] text-coral",
            meta.accent === "teal" &&
              "bg-[color-mix(in_oklch,var(--teal)_12%,transparent)] text-teal",
            meta.accent === "neutral" && "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-3.5" aria-hidden="true" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-serif font-medium text-sm text-foreground leading-snug mb-1">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
        {template.description}
      </p>

      {/* Footer: theme + content summary */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground capitalize">
          {THEME_LABELS[template.theme as StarterTheme] ?? template.theme}
        </span>
        <span className="text-[11px] text-muted-foreground/70">
          {template.contentSummary}
        </span>
      </div>
    </button>
  );
}
