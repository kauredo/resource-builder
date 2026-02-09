"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/resource/ResourceCard";
import { Plus, FileStack } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface StyleResourcesProps {
  styleId: Id<"styles">;
}

export function StyleResources({ styleId }: StyleResourcesProps) {
  const resources = useQuery(api.resources.getResourcesByStyle, { styleId });

  if (resources === undefined) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        role="status"
        aria-label="Loading resources"
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-4 animate-pulse motion-reduce:animate-none"
          >
            <div className="h-32 rounded-xl bg-muted mb-4" />
            <div className="h-5 w-3/4 bg-muted rounded mb-2" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border/60 bg-muted/30">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="size-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
            <FileStack className="size-6 text-coral/70" aria-hidden="true" />
          </div>
          <h3 className="font-medium text-foreground mb-1">
            No resources yet
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm leading-relaxed">
            Create your first resource with this style.
          </p>
          <Button asChild className="btn-coral gap-2">
            <Link href={`/dashboard/resources/new?styleId=${styleId}`}>
              <Plus className="size-4" aria-hidden="true" />
              Create Resource
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {resources.length} resource{resources.length !== 1 ? "s" : ""}
        </p>
        <Button asChild size="sm" className="btn-coral gap-1.5">
          <Link href={`/dashboard/resources/new?styleId=${styleId}`}>
            <Plus className="size-3.5" aria-hidden="true" />
            Create Resource
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((resource) => (
            <ResourceCard
              key={resource._id}
              id={resource._id}
              name={resource.name}
              type={resource.type}
              status={resource.status}
              itemCount={resource.assetCount ?? resource.images.length}
              updatedAt={resource.updatedAt}
              thumbnailUrl={resource.thumbnailUrl}
            />
          ))}
      </div>
    </div>
  );
}
