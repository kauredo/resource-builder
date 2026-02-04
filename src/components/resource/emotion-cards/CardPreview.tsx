"use client";

import { useState } from "react";
import Image from "next/image";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CardPreviewProps {
  emotion: string;
  imageUrl: string | null;
  isGenerating: boolean;
  hasError: boolean;
  showLabel?: boolean;
  onRegenerate?: () => void;
}

export function CardPreview({
  emotion,
  imageUrl,
  isGenerating,
  hasError,
  showLabel = true,
  onRegenerate,
}: CardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border-2 overflow-hidden bg-card transition-all",
        isGenerating && "border-coral/40",
        hasError && "border-destructive/40",
        !isGenerating && !hasError && "border-border"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-muted">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" role="status" aria-label={`Generating ${emotion}`}>
            <Loader2 className="size-8 text-coral animate-spin motion-reduce:animate-none" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Generating...</span>
          </div>
        ) : hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
            <span className="text-sm text-muted-foreground text-center">
              Failed to generate
            </span>
          </div>
        ) : imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={`Illustration for ${emotion}`}
              fill
              className="object-cover"
            />
            {/* Regenerate overlay */}
            {onRegenerate && isHovered && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onRegenerate}
                  className="gap-1.5"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Regenerate
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="p-3 border-t bg-card">
          <span className="font-medium text-sm">{emotion}</span>
        </div>
      )}

      {/* Error retry button */}
      {hasError && onRegenerate && (
        <div className="p-3 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={onRegenerate}
            className="w-full gap-1.5"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
