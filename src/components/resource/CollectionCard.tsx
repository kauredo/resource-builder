"use client";

import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface CollectionCardProps {
  id: string;
  name: string;
  description?: string;
  resourceCount: number;
  thumbnails: Array<{ id: string; url: string | null }>;
  updatedAt: number;
}

export function CollectionCard({
  id,
  name,
  description,
  resourceCount,
  thumbnails,
  updatedAt,
}: CollectionCardProps) {
  return (
    <Link
      href={`/dashboard/resources/collections/${id}`}
      className="group block rounded-lg border border-border/60 bg-card overflow-hidden transition-colors duration-150 motion-reduce:transition-none hover:border-coral/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      {/* Thumbnail mosaic */}
      <div className="aspect-[5/3] bg-muted/20 relative overflow-hidden">
        {thumbnails.length > 0 ? (
          <div className="grid grid-cols-2 h-full">
            {thumbnails.slice(0, 4).map((thumb, i) => (
              <div
                key={thumb.id}
                className="relative overflow-hidden"
                style={{
                  gridColumn: thumbnails.length === 1 ? "1 / -1" : undefined,
                  gridRow:
                    thumbnails.length === 1
                      ? "1 / -1"
                      : thumbnails.length === 3 && i === 0
                        ? "1 / -1"
                        : undefined,
                }}
              >
                {thumb.url ? (
                  <Image
                    src={thumb.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/40">
                    <FolderOpen className="size-6 text-muted-foreground/40" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="size-10 text-muted-foreground/30" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Coral accent line */}
      <div className="h-0.5 bg-coral/20 transition-opacity duration-150 group-hover:opacity-100 opacity-60" />

      {/* Card body */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-medium line-clamp-1">{name}</h3>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FolderOpen className="size-3" aria-hidden="true" />
            {resourceCount} resource{resourceCount !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(updatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
