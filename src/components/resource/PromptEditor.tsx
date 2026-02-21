"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface PromptEditorProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onRegenerate: () => Promise<void>;
  isGenerating: boolean;
}

export function PromptEditor({
  prompt,
  onPromptChange,
  onRegenerate,
  isGenerating,
}: PromptEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editValue, setEditValue] = useState(prompt);

  const isLong = prompt.length > 120;

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="btn-coral gap-1.5"
            onClick={async () => {
              onPromptChange(editValue);
              setIsEditing(false);
              await onRegenerate();
            }}
            disabled={isGenerating || !editValue.trim()}
          >
            {isGenerating ? (
              <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-3.5" aria-hidden="true" />
            )}
            Save & Regenerate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onPromptChange(editValue);
              setIsEditing(false);
            }}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditValue(prompt);
              setIsEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/prompt">
      <p
        className={`text-xs text-muted-foreground leading-relaxed ${!isExpanded && isLong ? "line-clamp-2" : ""}`}
      >
        {prompt}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded"
          >
            {isExpanded ? (
              <span className="inline-flex items-center gap-0.5">Less <ChevronUp className="size-3" /></span>
            ) : (
              <span className="inline-flex items-center gap-0.5">More <ChevronDown className="size-3" /></span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setEditValue(prompt);
            setIsEditing(true);
          }}
          className="text-xs text-muted-foreground/70 hover:text-foreground cursor-pointer transition-colors duration-150 inline-flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded"
        >
          <Pencil className="size-3" aria-hidden="true" />
          Edit prompt
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="text-xs text-muted-foreground/70 hover:text-foreground cursor-pointer transition-colors duration-150 inline-flex items-center gap-0.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 rounded"
        >
          {isGenerating ? (
            <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-3" aria-hidden="true" />
          )}
          Regenerate
        </button>
      </div>
    </div>
  );
}
