"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Pencil, Layers } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface ResourceCardProps {
  id: Id<"resources">;
  name: string;
  type: string;
  status: "draft" | "complete";
  cardCount: number;
  updatedAt: number;
  thumbnailUrl?: string | null;
  /** Show compact version without thumbnail */
  compact?: boolean;
}

// Format relative date for better readability
function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Format resource type for display
function formatResourceType(type: string): string {
  return type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ResourceCard({
  id,
  name,
  type,
  status,
  cardCount,
  updatedAt,
  thumbnailUrl,
  compact = false,
}: ResourceCardProps) {
  const isComplete = status === "complete";
  const hasThumbnail = thumbnailUrl && !compact;

  return (
    <Link
      href={`/dashboard/resources/${id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      <article
        className={`
          relative overflow-hidden rounded-2xl border bg-card
          transition-all duration-200 ease-out
          hover:shadow-lg hover:border-coral/50
          motion-reduce:transition-none
          ${hasThumbnail ? "border-border/50" : "border-border p-4"}
        `}
      >
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

              {/* Card count badge - top left */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-foreground rounded-md shadow-sm">
                  <Layers className="size-3" aria-hidden="true" />
                  {cardCount}
                </span>
              </div>

              {/* Status badge - top right */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md shadow-sm backdrop-blur-sm ${
                    isComplete
                      ? "bg-teal/90 text-white"
                      : "bg-white/90 text-muted-foreground"
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
            <div className="flex items-center justify-between gap-3 mb-3">
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
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Layers className="size-3" aria-hidden="true" />
                {cardCount} card{cardCount !== 1 ? "s" : ""}
              </span>
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
    </Link>
  );
}
