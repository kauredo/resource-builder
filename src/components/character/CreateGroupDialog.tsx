"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Users, Wand2 } from "lucide-react";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
  onCreated?: (groupId: Id<"characterGroups">) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  userId,
  onCreated,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [count, setCount] = useState(3);
  const [styleId, setStyleId] = useState<Id<"styles"> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const styles = useQuery(api.styles.getUserStyles, { userId });
  const generateGroup = useAction(api.characterActions.generateCharacterGroup);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateGroup({
        userId,
        groupName: name.trim(),
        groupDescription: description.trim(),
        count,
        ...(styleId ? { styleId } : {}),
      });

      onCreated?.(result.groupId);
      onOpenChange(false);
      // Reset form
      setName("");
      setDescription("");
      setCount(3);
      setStyleId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate group");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Users className="size-5 text-teal" aria-hidden="true" />
            Create Character Group
          </DialogTitle>
          <DialogDescription>
            Describe a group theme and AI will generate related but distinct
            characters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Forest Friends, Emotion Explorers"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-description">Description</Label>
            <Textarea
              id="group-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the group theme, style, and what connects them..."
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group-count">Number of Characters</Label>
              <Input
                id="group-count"
                type="number"
                min={2}
                max={8}
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.max(2, Math.min(8, parseInt(e.target.value) || 3)),
                  )
                }
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label>Linked Style</Label>
              <Select
                value={styleId ?? "none"}
                onValueChange={(value) =>
                  setStyleId(
                    value === "none" ? null : (value as Id<"styles">),
                  )
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {styles?.map((style) => (
                    <SelectItem key={style._id} value={style._id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isGenerating || !name.trim() || !description.trim()}
            className="gap-2 bg-teal text-white hover:bg-teal/90"
          >
            {isGenerating ? (
              <>
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="size-4" aria-hidden="true" />
                Generate Group
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
