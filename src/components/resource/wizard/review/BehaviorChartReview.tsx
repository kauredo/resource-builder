"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIWizardState } from "../use-ai-wizard";
import type { ChartFormat, BehaviorChartBehavior, BehaviorChartLevel } from "@/types";

interface BehaviorChartReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

const FORMAT_OPTIONS: { value: ChartFormat; label: string }[] = [
  { value: "sticker_chart", label: "Sticker Chart" },
  { value: "token_board", label: "Token Board" },
  { value: "progress_tracker", label: "Progress Tracker" },
];

export function BehaviorChartReview({
  state,
  onUpdate,
}: BehaviorChartReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const chartFormat = (content.chartFormat as ChartFormat) || "sticker_chart";
  const title = (content.title as string) || "";
  const instructions = (content.instructions as string) || "";
  const behaviors = (content.behaviors as BehaviorChartBehavior[]) || [];
  const reward = (content.reward as Record<string, unknown>) || {};
  const columns = (content.columns as number) || 5;
  const columnLabels = (content.columnLabels as string[]) || [];
  const totalSlots = (content.totalSlots as number) || 8;
  const tokenName = (content.tokenName as string) || "star";
  const levels = (content.levels as BehaviorChartLevel[]) || [];

  const updateContent = (updates: Record<string, unknown>) => {
    onUpdate({ generatedContent: { ...content, ...updates } });
  };

  const updateBehavior = (
    index: number,
    field: keyof BehaviorChartBehavior,
    value: string,
  ) => {
    const updated = [...behaviors];
    updated[index] = { ...updated[index], [field]: value };
    const newContent = { ...content, behaviors: updated };

    if (field === "imagePrompt") {
      onUpdate({
        generatedContent: newContent,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === `chart_behavior_icon:behavior_${index}`
            ? { ...item, prompt: value }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  const addBehavior = () => {
    const id = crypto.randomUUID();
    const newIndex = behaviors.length;
    const newBehavior: BehaviorChartBehavior = {
      id,
      name: "",
      imagePrompt: "",
      imageAssetKey: `chart_behavior_icon:behavior_${newIndex}`,
    };
    const newBehaviors = [...behaviors, newBehavior];

    onUpdate({
      generatedContent: { ...content, behaviors: newBehaviors },
      imageItems: [
        ...state.imageItems,
        {
          assetKey: `chart_behavior_icon:behavior_${newIndex}`,
          assetType: "chart_behavior_icon",
          prompt: "Behavior icon illustration",
          includeText: false,
          aspect: "1:1" as const,
          greenScreen: true,
          label: `Behavior ${newIndex + 1}`,
          group: "Behavior Icons",
          status: "pending" as const,
        },
      ],
    });
  };

  const removeBehavior = (index: number) => {
    const newBehaviors = behaviors.filter((_, i) => i !== index);
    const newContent = { ...content, behaviors: newBehaviors };

    // Rebuild behavior icon image items with corrected indices
    const nonBehaviorItems = state.imageItems.filter(
      (item) => item.assetType !== "chart_behavior_icon",
    );
    const newBehaviorItems = newBehaviors.map((b, i) => ({
      assetKey: `chart_behavior_icon:behavior_${i}`,
      assetType: "chart_behavior_icon",
      prompt: b.imagePrompt || `Icon for behavior: ${b.name}`,
      includeText: false,
      aspect: "1:1" as const,
      greenScreen: true,
      label: b.name || `Behavior ${i + 1}`,
      group: "Behavior Icons",
      status: "pending" as const,
    }));

    // Update asset keys in content
    const updatedBehaviors = newBehaviors.map((b, i) => ({
      ...b,
      imageAssetKey: `chart_behavior_icon:behavior_${i}`,
    }));

    onUpdate({
      generatedContent: { ...newContent, behaviors: updatedBehaviors },
      imageItems: [...nonBehaviorItems, ...newBehaviorItems],
    });
  };

  const updateReward = (field: string, value: string) => {
    const newReward = { ...reward, [field]: value };
    const newContent = { ...content, reward: newReward };

    if (field === "imagePrompt") {
      onUpdate({
        generatedContent: newContent,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === "chart_reward"
            ? { ...item, prompt: value }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  const updateLevel = (
    index: number,
    field: keyof BehaviorChartLevel,
    value: string,
  ) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    updateContent({ levels: updated });
  };

  const addLevel = () => {
    const newLevel: BehaviorChartLevel = {
      id: crypto.randomUUID(),
      name: `Level ${levels.length + 1}`,
      milestone: "",
    };
    updateContent({ levels: [...levels, newLevel] });
  };

  const removeLevel = (index: number) => {
    updateContent({ levels: levels.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Review and edit the AI-generated behavior chart before generating
          images.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-name" className="font-medium">
          Chart Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          maxLength={100}
          placeholder="Behavior chart name"
        />
      </div>

      {/* Chart Format */}
      <div className="space-y-2">
        <Label className="font-medium">Chart Format</Label>
        <div className="flex gap-2">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateContent({ chartFormat: opt.value })}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg cursor-pointer",
                "transition-colors duration-150 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                chartFormat === opt.value
                  ? "bg-coral text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
              aria-pressed={chartFormat === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-title" className="font-medium">
          Chart Title
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => updateContent({ title: e.target.value })}
          maxLength={100}
          placeholder="Title displayed on the chart"
        />
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label htmlFor="review-instructions" className="font-medium">
          Instructions
        </Label>
        <Textarea
          id="review-instructions"
          value={instructions}
          onChange={(e) => updateContent({ instructions: e.target.value })}
          placeholder="How to use this chart"
          rows={2}
        />
      </div>

      {/* Header Image Prompt */}
      <div className="space-y-2">
        <Label htmlFor="review-header-prompt" className="font-medium">
          Header Image Prompt
        </Label>
        <Textarea
          id="review-header-prompt"
          value={(content.headerImagePrompt as string) || ""}
          onChange={(e) => {
            const newContent = {
              ...content,
              headerImagePrompt: e.target.value,
            };
            onUpdate({
              generatedContent: newContent,
              imageItems: state.imageItems.map((item) =>
                item.assetKey === "chart_header"
                  ? {
                      ...item,
                      prompt: `Behavior chart header illustration: ${e.target.value}`,
                    }
                  : item,
              ),
            });
          }}
          placeholder="Describe the decorative header illustration"
          rows={2}
        />
      </div>

      {/* Behaviors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Behaviors ({behaviors.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addBehavior}
            className="gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Behavior
          </Button>
        </div>

        {behaviors.map((behavior, index) => (
          <div
            key={behavior.id || index}
            className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Behavior {index + 1}
              </span>
              {behaviors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBehavior(index)}
                  className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                  aria-label={`Remove behavior ${index + 1}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor={`behavior-${index}-name`}
                  className="text-xs"
                >
                  Name
                </Label>
                <Input
                  id={`behavior-${index}-name`}
                  value={behavior.name}
                  onChange={(e) =>
                    updateBehavior(index, "name", e.target.value)
                  }
                  placeholder="Behavior name"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor={`behavior-${index}-desc`}
                  className="text-xs"
                >
                  Description
                </Label>
                <Input
                  id={`behavior-${index}-desc`}
                  value={behavior.description || ""}
                  onChange={(e) =>
                    updateBehavior(index, "description", e.target.value)
                  }
                  placeholder="What this behavior looks like"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor={`behavior-${index}-prompt`}
                className="text-xs"
              >
                Icon Image Prompt
              </Label>
              <Textarea
                id={`behavior-${index}-prompt`}
                value={behavior.imagePrompt || ""}
                onChange={(e) =>
                  updateBehavior(index, "imagePrompt", e.target.value)
                }
                placeholder="Describe the icon illustration"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reward */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Reward
        </h3>
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="reward-name" className="text-xs">
                Name
              </Label>
              <Input
                id="reward-name"
                value={(reward.name as string) || ""}
                onChange={(e) => updateReward("name", e.target.value)}
                placeholder="Reward name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reward-desc" className="text-xs">
                Description
              </Label>
              <Input
                id="reward-desc"
                value={(reward.description as string) || ""}
                onChange={(e) => updateReward("description", e.target.value)}
                placeholder="What the child earns"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reward-prompt" className="text-xs">
              Reward Image Prompt
            </Label>
            <Textarea
              id="reward-prompt"
              value={(reward.imagePrompt as string) || ""}
              onChange={(e) => updateReward("imagePrompt", e.target.value)}
              placeholder="Describe the reward illustration"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Format-specific fields */}
      {chartFormat === "sticker_chart" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Sticker Chart Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sticker-columns">
                Columns ({columns})
              </Label>
              <Input
                id="sticker-columns"
                type="number"
                min={3}
                max={10}
                value={columns}
                onChange={(e) =>
                  updateContent({ columns: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sticker-labels">
                Column Labels (comma-separated)
              </Label>
              <Input
                id="sticker-labels"
                value={columnLabels.join(", ")}
                onChange={(e) =>
                  updateContent({
                    columnLabels: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Mon, Tue, Wed, Thu, Fri"
              />
            </div>
          </div>
        </div>
      )}

      {chartFormat === "token_board" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Token Board Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token-slots">Total Slots ({totalSlots})</Label>
              <Input
                id="token-slots"
                type="number"
                min={3}
                max={20}
                value={totalSlots}
                onChange={(e) =>
                  updateContent({ totalSlots: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                value={tokenName}
                onChange={(e) =>
                  updateContent({ tokenName: e.target.value })
                }
                placeholder="star, gem, heart..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-prompt">Token Image Prompt</Label>
            <Textarea
              id="token-prompt"
              value={(content.tokenImagePrompt as string) || ""}
              onChange={(e) => {
                const newContent = {
                  ...content,
                  tokenImagePrompt: e.target.value,
                };
                onUpdate({
                  generatedContent: newContent,
                  imageItems: state.imageItems.map((item) =>
                    item.assetKey === "chart_token"
                      ? { ...item, prompt: e.target.value }
                      : item,
                  ),
                });
              }}
              placeholder="Describe the token design"
              rows={2}
            />
          </div>
        </div>
      )}

      {chartFormat === "progress_tracker" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Levels ({levels.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addLevel}
              className="gap-1.5"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add Level
            </Button>
          </div>

          {levels.map((level, index) => (
            <div
              key={level.id || index}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Level {index + 1}
                </span>
                {levels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLevel(index)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                    aria-label={`Remove level ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`level-${index}-name`} className="text-xs">
                    Name
                  </Label>
                  <Input
                    id={`level-${index}-name`}
                    value={level.name}
                    onChange={(e) =>
                      updateLevel(index, "name", e.target.value)
                    }
                    placeholder="Level name"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`level-${index}-milestone`}
                    className="text-xs"
                  >
                    Milestone
                  </Label>
                  <Input
                    id={`level-${index}-milestone`}
                    value={level.milestone}
                    onChange={(e) =>
                      updateLevel(index, "milestone", e.target.value)
                    }
                    placeholder="What you've achieved"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
