"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DuplicateResourceDialogProps {
  resourceId: Id<"resources">;
  resourceName: string;
  trigger: ReactNode;
}

export function DuplicateResourceDialog({
  resourceId,
  resourceName,
  trigger,
}: DuplicateResourceDialogProps) {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const duplicateResource = useMutation(api.resources.duplicateResource);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(`${resourceName} (Copy)`);
    }
    setOpen(nextOpen);
  };

  const handleDuplicate = async () => {
    if (!user?._id) return;
    setIsDuplicating(true);
    try {
      const newId = await duplicateResource({
        resourceId,
        userId: user._id,
        newName: name.trim() || undefined,
      });
      setOpen(false);
      router.push(`/dashboard/resources/${newId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Duplication failed";
      if (msg.startsWith("LIMIT_REACHED:")) {
        toast.error(msg.split(":").slice(2).join(":"));
      } else {
        toast.error(msg);
      }
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate this resource</DialogTitle>
          <DialogDescription>
            Create a copy you can modify independently. All images will be
            preserved and the copy will start as a draft.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="duplicate-name" className="mb-2">
            Name
          </Label>
          <Input
            id="duplicate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New resource name"
            autoFocus
            maxLength={120}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDuplicating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={isDuplicating || !name.trim()}
            className="btn-coral"
          >
            {isDuplicating && (
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none mr-2"
                aria-hidden="true"
              />
            )}
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
