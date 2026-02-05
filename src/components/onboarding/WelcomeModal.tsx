"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const WELCOME_SEEN_KEY = "resource-builder-welcome-seen";

interface WelcomeModalProps {
  userName?: string;
  hasResources: boolean;
  userId?: Id<"users">;
}

function StylePresetChip({
  name,
  colors,
  isSelected,
  onClick,
}: {
  name: string;
  colors: { primary: string; secondary: string; accent: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer
        transition-colors duration-150 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2
        active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100
        ${
          isSelected
            ? "border-coral bg-coral/5 ring-1 ring-coral/30"
            : "border-border bg-white hover:border-muted-foreground/30 hover:bg-muted/30"
        }
      `}
      type="button"
    >
      <div className="flex -space-x-1" aria-hidden="true">
        {[colors.primary, colors.secondary, colors.accent].map((color, i) => (
          <div
            key={i}
            className="size-3.5 rounded-full border-2 border-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground/80 whitespace-nowrap">
        {name}
      </span>
    </button>
  );
}

export function WelcomeModal({ userName, hasResources, userId }: WelcomeModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState<Id<"styles"> | null>(null);

  // Query user's styles (including presets) - same source as /dashboard/styles
  const userStyles = useQuery(
    api.styles.getUserStyles,
    userId ? { userId } : "skip"
  );
  const presetStyles = userStyles?.filter(s => s.isPreset) ?? [];

  // Check if we should show the modal
  useEffect(() => {
    // Don't show if user already has resources
    if (hasResources) return;

    // Check localStorage
    const hasSeenWelcome = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!hasSeenWelcome) {
      // Small delay to let page render first
      const timer = setTimeout(() => setIsOpen(true), 300);
      return () => clearTimeout(timer);
    }
  }, [hasResources]);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, "true");
    setIsOpen(false);
  };

  const handleStartCreating = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, "true");
    setIsOpen(false);
    // Pass selected style ID to wizard if one was chosen
    const url = selectedStyleId
      ? `/dashboard/resources/new/emotion-cards?styleId=${selectedStyleId}`
      : "/dashboard/resources/new/emotion-cards";
    router.push(url);
  };

  const firstName = userName?.split(" ")[0] || "there";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={false}
        aria-describedby="welcome-description"
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-serif text-2xl tracking-tight">
            Welcome, {firstName}
          </DialogTitle>
          <DialogDescription id="welcome-description" className="text-base">
            Ready to make something your clients will love?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Style presets showcase */}
          <p className="text-sm text-muted-foreground mb-3 text-center">
            Pick a visual style that feels right:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {presetStyles.map((style) => (
              <StylePresetChip
                key={style._id}
                name={style.name}
                colors={style.colors}
                isSelected={selectedStyleId === style._id}
                onClick={() => setSelectedStyleId(style._id)}
              />
            ))}
          </div>

          {/* Value prop reminder */}
          <p className="text-sm text-muted-foreground mt-5 text-center max-w-sm mx-auto">
            We&apos;ll create matching illustrations for each emotion — ready
            to print and use in your next session.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleStartCreating}
            className="btn-coral w-full h-11 gap-2"
          >
            Create my first deck
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            I&apos;ll explore first
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
