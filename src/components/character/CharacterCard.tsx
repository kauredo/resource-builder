"use client";

import Link from "next/link";
import { User, ImageIcon } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";

interface CharacterCardProps {
  id: Id<"characters">;
  name: string;
  personality: string;
  referenceImageCount: number;
  thumbnailUrl: string | null;
  updatedAt?: number;
}

export function CharacterCard({
  id,
  name,
  personality,
  referenceImageCount,
  thumbnailUrl,
  updatedAt,
}: CharacterCardProps) {
  return (
    <Link
      href={`/dashboard/characters/${id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded-lg"
    >
      <article className="rounded-lg border border-border/50 bg-card overflow-hidden transition-colors duration-150 group-hover:border-teal/40 motion-reduce:transition-none">
        {/* Thumbnail area */}
        <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`${name} reference`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {/* Dotted circle placeholder — invites "add a portrait" */}
              <div className="size-20 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center group-hover:border-teal/30 transition-colors duration-150 motion-reduce:transition-none">
                <User
                  className="size-8 text-muted-foreground/25"
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </div>

        {/* Teal accent line — character's signature color */}
        <div className="h-0.5 bg-teal/40 group-hover:bg-teal/70 transition-colors duration-150 motion-reduce:transition-none" />

        {/* Card body */}
        <div className="px-4 py-3">
          <p className="font-medium leading-snug line-clamp-1">{name}</p>
          {personality ? (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {personality}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 mt-0.5 italic">
              No personality defined yet
            </p>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-2 mt-3">
            {referenceImageCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal/8 text-teal">
                <ImageIcon className="size-2.5" aria-hidden="true" />
                {referenceImageCount} image{referenceImageCount !== 1 ? "s" : ""}
              </span>
            )}
            {updatedAt && (
              <time
                dateTime={new Date(updatedAt).toISOString()}
                className="text-xs text-muted-foreground tabular-nums"
              >
                {formatRelativeDate(updatedAt)}
              </time>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
