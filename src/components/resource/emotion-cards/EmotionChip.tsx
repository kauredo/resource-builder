"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmotionChipProps {
  emotion: string;
  isSelected: boolean;
  onToggle: () => void;
  isCustom?: boolean;
  onRemove?: () => void;
}

export function EmotionChip({
  emotion,
  isSelected,
  onToggle,
  isCustom = false,
  onRemove,
}: EmotionChipProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (isCustom && onRemove) {
        e.preventDefault();
        onRemove();
      }
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all",
          "border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          isCustom && onRemove ? "rounded-l-full" : "rounded-full",
          isSelected
            ? "bg-coral/10 border-coral text-coral hover:bg-coral/20"
            : "bg-card border-border text-foreground/80 hover:border-coral/40 hover:bg-coral/5"
        )}
        aria-pressed={isSelected}
      >
        {isSelected && <Check className="size-3.5" aria-hidden="true" />}
        {emotion}
      </button>
      {isCustom && onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          className={cn(
            "inline-flex items-center justify-center px-2 py-1.5 rounded-r-full text-sm transition-all",
            "border-2 border-l-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
            isSelected
              ? "bg-coral/10 border-coral text-coral hover:bg-coral/30"
              : "bg-card border-border text-foreground/60 hover:bg-destructive/10 hover:text-destructive"
          )}
          aria-label={`Remove ${emotion}`}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
