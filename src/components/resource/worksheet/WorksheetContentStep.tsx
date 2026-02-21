"use client";

import { Fragment } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wand2, Loader2, Plus } from "lucide-react";
import { WorksheetBlockEditor } from "./WorksheetBlockEditor";
import { DetectedCharactersReview } from "@/components/resource/wizard/DetectedCharactersReview";
import type { WorksheetWizardState } from "./use-worksheet-wizard";
import type { WorksheetBlock } from "@/types";

const BLOCK_GROUPS: {
  label: string;
  types: { type: WorksheetBlock["type"]; label: string }[];
}[] = [
  {
    label: "Text",
    types: [
      { type: "heading", label: "Heading" },
      { type: "prompt", label: "Prompt" },
      { type: "text", label: "Text" },
    ],
  },
  {
    label: "Interactive",
    types: [
      { type: "lines", label: "Lines" },
      { type: "checklist", label: "Checklist" },
      { type: "scale", label: "Scale" },
      { type: "drawing_box", label: "Drawing Box" },
    ],
  },
  {
    label: "Structured",
    types: [
      { type: "word_bank", label: "Word Bank" },
      { type: "matching", label: "Matching" },
      { type: "fill_in_blank", label: "Fill in Blank" },
      { type: "multiple_choice", label: "Multiple Choice" },
    ],
  },
  {
    label: "Media",
    types: [
      { type: "image", label: "Image" },
      { type: "table", label: "Table" },
    ],
  },
];

interface WorksheetContentStepProps {
  state: WorksheetWizardState;
  onUpdate: (updates: Partial<WorksheetWizardState>) => void;
  onGenerateContent: () => Promise<void>;
  onUpdateCharacterPrompt: (
    characterId: string,
    promptFragment: string,
  ) => void;
  onRemoveDetectedCharacter: (characterId: string) => void;
  addBlock: (type: WorksheetBlock["type"]) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: "up" | "down") => void;
  updateBlock: (blockId: string, updates: Partial<WorksheetBlock>) => void;
}

export function WorksheetContentStep({
  state,
  onUpdate,
  onGenerateContent,
  onUpdateCharacterPrompt,
  onRemoveDetectedCharacter,
  addBlock,
  removeBlock,
  moveBlock,
  updateBlock,
}: WorksheetContentStepProps) {
  const isGenerating = state.contentStatus === "generating";
  const hasContent =
    state.contentStatus === "ready" && state.blocks.length > 0;

  return (
    <div className="space-y-8">
      {/* AI generation section */}
      {state.creationMode === "ai" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="worksheet-description"
              className="text-base font-medium"
            >
              Describe your worksheet
            </Label>
            <p className="text-sm text-muted-foreground">
              Tell the AI what this worksheet is about and it will generate all
              the blocks and content.
            </p>
            <Textarea
              id="worksheet-description"
              value={state.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="A CBT thought record for 8 year olds with anxiety. Include a feelings scale, thought challenging questions, and a coping skills checklist."
              rows={hasContent ? 3 : 5}
              className="text-base"
            />
          </div>

          {state.contentStatus === "error" && state.contentError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive" role="alert">
              {state.contentError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={onGenerateContent}
              disabled={!state.description.trim() || isGenerating}
              className={hasContent ? "gap-2" : "btn-coral gap-2"}
              variant={hasContent ? "outline" : "default"}
            >
              <Wand2 className="size-4" aria-hidden="true" />
              {hasContent ? "Regenerate Content" : "Generate Worksheet"}
            </Button>
            {isGenerating && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Creating your worksheet...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Manual mode intro */}
      {state.creationMode === "manual" && state.blocks.length === 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-medium">Build your worksheet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add blocks to build your worksheet. Choose from 13 block types
              to create an interactive activity sheet.
            </p>
          </div>
        </div>
      )}

      {/* Detected characters review */}
      {hasContent && (
        <DetectedCharactersReview
          characters={state.detectedCharacters}
          status={state.detectedCharactersStatus}
          styleId={state.styleId ?? undefined}
          onUpdatePromptFragment={onUpdateCharacterPrompt}
          onRemoveCharacter={onRemoveDetectedCharacter}
        />
      )}

      {/* Title editor */}
      {(hasContent || state.creationMode === "manual") && (
        <div className="space-y-2 max-w-xl">
          <Label htmlFor="worksheet-title" className="text-base font-medium">
            Worksheet title
          </Label>
          <Input
            id="worksheet-title"
            value={state.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Title shown at the top of the worksheet"
            className="text-base"
          />
        </div>
      )}

      {/* Grouped block type toolbar */}
      {(hasContent || state.creationMode === "manual") && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Add block
          </Label>
          {BLOCK_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.types.map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addBlock(type)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block editors */}
      {(hasContent ||
        (state.creationMode === "manual" && state.blocks.length > 0)) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">
              Blocks ({state.blocks.length})
            </h3>
          </div>

          <div className="space-y-3">
            {state.blocks.map((block, i) => (
              <WorksheetBlockEditor
                key={block.id}
                block={block}
                index={i}
                totalBlocks={state.blocks.length}
                onUpdate={updateBlock}
                onMove={moveBlock}
                onRemove={removeBlock}
              />
            ))}
          </div>

          {/* Bottom add-block dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Plus className="size-4" aria-hidden="true" />
                Add block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {BLOCK_GROUPS.map((group, gi) => (
                <Fragment key={group.label}>
                  {gi > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {group.types.map(({ type, label }) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => addBlock(type)}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Empty manual state */}
      {state.creationMode === "manual" && state.blocks.length === 0 && (
        <div className="text-center py-8 rounded-xl border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground mb-4">
            No blocks yet. Use the buttons above to add your first block.
          </p>
        </div>
      )}
    </div>
  );
}
