"use client";

import { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardLayoutProps {
  title: string;
  stepLabels: string[];
  stepTitles: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  isStepComplete?: boolean[];
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  canGoNext: boolean;
  isNavigating: boolean;
  isEditMode?: boolean;
  nextLabel?: string;
  children: ReactNode;
}

export function WizardLayout({
  title,
  stepLabels,
  stepTitles,
  currentStep,
  onStepClick,
  isStepComplete,
  onBack,
  onNext,
  onCancel,
  canGoNext,
  isNavigating,
  isEditMode = false,
  nextLabel,
  children,
}: WizardLayoutProps) {
  const totalSteps = stepLabels.length;
  const progress = (currentStep + 1) / totalSteps;
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 border-b border-border/60 pb-5">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 motion-reduce:transition-none mb-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {isEditMode ? "Back to Resource" : "Dashboard"}
        </button>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {isEditMode ? "Editing" : "New"} {title}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight mt-2">
              {stepTitles[currentStep]}
            </h1>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>

        <nav className="mt-4" aria-label="Wizard progress">
          <div className="h-1 w-full rounded-full bg-border/70">
            <div
              className="h-1 rounded-full bg-coral origin-left transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
          <ol className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isComplete = i < currentStep;
              const isCurrent = i === currentStep;
              const canJumpTo =
                !!onStepClick &&
                (isStepComplete ? isStepComplete[i] : i < currentStep);
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={canJumpTo ? () => onStepClick?.(i) : undefined}
                    disabled={!canJumpTo}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]",
                      canJumpTo
                        ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 transition-colors duration-150 motion-reduce:transition-none"
                        : "cursor-default",
                      isCurrent
                        ? "border-coral/40 text-foreground bg-[color-mix(in_oklch,var(--coral)_12%,transparent)]"
                        : isComplete
                          ? "border-border/70 text-muted-foreground"
                          : "border-border/60 text-muted-foreground/60",
                    )}
                  >
                    <span className="tabular-nums">{i + 1}</span>
                    <span className="hidden sm:inline">{stepLabels[i]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="min-h-[420px]">{children}</div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0 || isNavigating}
          className="min-w-[100px]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>

        {currentStep < totalSteps - 1 ? (
          <Button
            className="btn-coral min-w-[120px]"
            onClick={onNext}
            disabled={!canGoNext || isNavigating}
          >
            {isNavigating ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              <>
                {nextLabel ?? "Continue"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        ) : (
          <Button className="btn-coral min-w-[120px]" onClick={onCancel}>
            Done
            <Check className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
