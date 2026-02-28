"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Pencil, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRelativeDate } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

interface ResourceCardProps {
  id: Id<"resources">;
  name: string;
  type: string;
  status: "draft" | "complete";
  itemCount: number;
  updatedAt: number;
  thumbnailUrl?: string | null;
  /** Show compact version without thumbnail */
  compact?: boolean;
  /** Selection mode */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

// Format resource type for display
function formatResourceType(type: string): string {
  return type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatCountLabel(type: string, count: number): string {
  switch (type) {
    case "emotion_cards":
    case "flashcards":
    case "card_game":
      return `${count} card${count !== 1 ? "s" : ""}`;
    case "worksheet":
      return `${count} block${count !== 1 ? "s" : ""}`;
    case "board_game":
      return `${count} space${count !== 1 ? "s" : ""}`;
    case "poster":
    case "free_prompt":
      return `${count} image${count !== 1 ? "s" : ""}`;
    case "book":
      return `${count} page${count !== 1 ? "s" : ""}`;
    default:
      return `${count} item${count !== 1 ? "s" : ""}`;
  }
}

function CardContent({
  name,
  type,
  status,
  itemCount,
  updatedAt,
  thumbnailUrl,
  compact = false,
  selected,
  selectable,
}: Omit<ResourceCardProps, "id" | "onSelect">) {
  const isComplete = status === "complete";
  const hasThumbnail = thumbnailUrl && !compact;

  return (
    <article
      className={`
        relative overflow-hidden rounded-xl border bg-card
        transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out
        hover:-translate-y-0.5 hover:border-foreground/20
        motion-reduce:transition-none motion-reduce:transform-none
        ${hasThumbnail ? "border-border/60" : "border-border/60 p-4"}
        ${selectable && selected ? "ring-2 ring-coral border-coral/40" : ""}
      `}
    >
      {/* Selection checkbox overlay */}
      {selectable && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox
            checked={selected}
            aria-label={`Select ${name}`}
            className="size-5 border-2 bg-background/90 data-[state=checked]:bg-coral data-[state=checked]:border-coral"
            tabIndex={-1}
          />
        </div>
      )}

      {/* Thumbnail version */}
      {hasThumbnail && (
        <>
          {/* Image area with gradient overlay */}
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <Image
              src={thumbnailUrl}
              alt={`Preview of ${name}`}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100 motion-reduce:transition-none"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Card count badge - top left (shifted right when selectable) */}
            {itemCount > 0 && (
              <div className={`absolute top-3 ${selectable ? "left-11" : "left-3"}`}>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-background/90 border border-border/60 text-foreground rounded-md whitespace-nowrap max-w-[140px] truncate"
                  title={formatCountLabel(type, itemCount)}
                >
                  <Layers className="size-3" aria-hidden="true" />
                  {formatCountLabel(type, itemCount)}
                </span>
              </div>
            )}

            {/* Status badge - top right */}
            <div className="absolute top-3 right-3">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md border whitespace-nowrap bg-background/90 ${
                  isComplete
                    ? "border-teal/40 text-foreground"
                    : "border-border/60 text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <Pencil className="size-3" aria-hidden="true" />
                )}
                {isComplete ? "Done" : "Draft"}
              </span>
            </div>
          </div>

          {/* Content area */}
          <div className="p-4">
            <h3 className="font-medium text-foreground leading-snug line-clamp-1 group-hover:text-coral transition-colors duration-150 motion-reduce:transition-none">
              {name}
            </h3>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-sm text-muted-foreground">
                {formatResourceType(type)}
              </p>
              <time
                className="text-xs text-muted-foreground/70"
                dateTime={new Date(updatedAt).toISOString()}
              >
                {formatRelativeDate(updatedAt)}
              </time>
            </div>
          </div>
        </>
      )}

      {/* Compact version (no thumbnail) */}
      {!hasThumbnail && (
        <>
          {/* Top row: status + card count */}
          <div className={`flex items-center justify-between gap-3 mb-3 ${selectable ? "ml-8" : ""}`}>
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                isComplete
                  ? "bg-teal/10 text-teal"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isComplete ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                <Pencil className="size-3" aria-hidden="true" />
              )}
              {isComplete ? "Complete" : "Draft"}
            </span>
            {itemCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Layers className="size-3" aria-hidden="true" />
                {formatCountLabel(type, itemCount)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-foreground mb-1 truncate group-hover:text-coral transition-colors duration-150 motion-reduce:transition-none">
            {name}
          </h3>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {formatResourceType(type)}
            </p>
            <time
              className="text-xs text-muted-foreground/70"
              dateTime={new Date(updatedAt).toISOString()}
            >
              {formatRelativeDate(updatedAt)}
            </time>
          </div>
        </>
      )}
    </article>
  );
}

export function ResourceCard({
  id,
  name,
  type,
  status,
  itemCount,
  updatedAt,
  thumbnailUrl,
  compact = false,
  selectable,
  selected,
  onSelect,
}: ResourceCardProps) {
  if (selectable) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(id)}
        aria-pressed={selected}
        className="group block w-full text-left rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors duration-150 motion-reduce:transition-none"
      >
        <CardContent
          name={name}
          type={type}
          status={status}
          itemCount={itemCount}
          updatedAt={updatedAt}
          thumbnailUrl={thumbnailUrl}
          compact={compact}
          selectable={selectable}
          selected={selected}
        />
      </button>
    );
  }

  return (
    <Link
      href={`/dashboard/resources/${id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      <CardContent
        name={name}
        type={type}
        status={status}
        itemCount={itemCount}
        updatedAt={updatedAt}
        thumbnailUrl={thumbnailUrl}
        compact={compact}
      />
    </Link>
  );
}
