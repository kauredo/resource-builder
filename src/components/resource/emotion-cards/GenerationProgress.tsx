"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2, Check, AlertCircle } from "lucide-react";

interface GenerationProgressProps {
  total: number;
  completed: number;
  failed: number;
  currentEmotion?: string;
}

export function GenerationProgress({
  total,
  completed,
  failed,
  currentEmotion,
}: GenerationProgressProps) {
  const progress = total > 0 ? ((completed + failed) / total) * 100 : 0;
  const isComplete = completed + failed === total;
  const hasErrors = failed > 0;

  return (
    <div
      className="rounded-xl border bg-card p-6 space-y-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isComplete ? (
            hasErrors ? (
              <div className="size-10 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertCircle className="size-5 text-amber-700" aria-hidden="true" />
              </div>
            ) : (
              <div className="size-10 rounded-full bg-teal/20 flex items-center justify-center">
                <Check className="size-5 text-teal" aria-hidden="true" />
              </div>
            )
          ) : (
            <div className="size-10 rounded-full bg-coral/10 flex items-center justify-center">
              <Loader2 className="size-5 text-coral animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </div>
          )}
          <div>
            <h3 className="font-medium">
              {isComplete
                ? hasErrors
                  ? "Generation complete with errors"
                  : "Generation complete!"
                : "Generating images..."}
            </h3>
            {currentEmotion && !isComplete && (
              <p className="text-sm text-muted-foreground">
                Currently generating: {currentEmotion}
              </p>
            )}
          </div>
        </div>
        <div className="text-right font-variant-numeric: tabular-nums">
          <span className="text-2xl font-semibold tabular-nums">
            {completed}
          </span>
          <span className="text-muted-foreground tabular-nums">/{total}</span>
          {failed > 0 && (
            <p className="text-xs text-destructive tabular-nums">{failed} failed</p>
          )}
        </div>
      </div>

      <Progress
        value={progress}
        className="h-2"
        aria-label={`Generation progress: ${Math.round(progress)}%`}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="tabular-nums">
          {isComplete
            ? `Generated ${completed} of ${total} cards`
            : `${Math.round(progress)}% complete`}
        </span>
        {!isComplete && (
          <span>
            {total - completed - failed <= 2 ? "Almost done..." : "This may take a moment"}
          </span>
        )}
      </div>
    </div>
  );
}
