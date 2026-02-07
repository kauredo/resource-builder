"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tag, X } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

interface ResourceTagsEditorProps {
  resourceId: Id<"resources">;
  tags?: string[] | null;
}

const normalizeTag = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

export function ResourceTagsEditor({ resourceId, tags }: ResourceTagsEditorProps) {
  const [value, setValue] = useState("");
  const updateResource = useMutation(api.resources.updateResource);

  const normalizedTags = useMemo(() => {
    if (!tags) return [];
    const unique = new Set<string>();
    for (const tag of tags) {
      const normalized = normalizeTag(tag);
      if (normalized) unique.add(normalized);
    }
    return Array.from(unique);
  }, [tags]);

  const handleAdd = async () => {
    const next = normalizeTag(value);
    if (!next) return;
    if (normalizedTags.includes(next)) {
      setValue("");
      return;
    }
    await updateResource({ resourceId, tags: [...normalizedTags, next] });
    setValue("");
  };

  const handleRemove = async (tag: string) => {
    const nextTags = normalizedTags.filter((item) => item !== tag);
    await updateResource({ resourceId, tags: nextTags });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
        Tags
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {normalizedTags.length === 0 && (
          <span className="text-xs text-muted-foreground">
            Add tags to organize this resource.
          </span>
        )}
        {normalizedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="cursor-pointer rounded-full p-0.5 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors duration-150 motion-reduce:transition-none"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3 max-w-lg">
        <div className="flex-1 space-y-2">
          <Label htmlFor={`tag-input-${resourceId}`} className="text-xs text-muted-foreground">
            Add tag
          </Label>
          <Input
            id={`tag-input-${resourceId}`}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                void handleAdd();
              }
            }}
            placeholder="e.g., breathing, social skills"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="shrink-0"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
