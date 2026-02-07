"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DraftResumeDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onResume: () => void;
  onStartFresh: () => void;
}

export function DraftResumeDialog({
  open,
  title = "Resume your draft?",
  description =
    "We found an unfinished draft. You can pick up where you left off or start fresh.",
  onResume,
  onStartFresh,
}: DraftResumeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onStartFresh}>
            Start fresh
          </Button>
          <Button className="btn-coral" onClick={onResume}>
            Resume draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
