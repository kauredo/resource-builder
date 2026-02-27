"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIWizardState } from "../use-ai-wizard";
import type { ScheduleFormat, VisualScheduleActivity } from "@/types";

interface VisualScheduleReviewProps {
  state: AIWizardState;
  onUpdate: (updates: Partial<AIWizardState>) => void;
}

const FORMAT_OPTIONS: { value: ScheduleFormat; label: string }[] = [
  { value: "routine_strip", label: "Routine Strip" },
  { value: "schedule_board", label: "Schedule Board" },
  { value: "first_then", label: "First-Then" },
];

export function VisualScheduleReview({
  state,
  onUpdate,
}: VisualScheduleReviewProps) {
  const content = (state.generatedContent ?? {}) as Record<string, unknown>;
  const scheduleFormat = (content.scheduleFormat as ScheduleFormat) || "routine_strip";
  const title = (content.title as string) || "";
  const instructions = (content.instructions as string) || "";
  const activities = (content.activities as VisualScheduleActivity[]) || [];
  const timeLabels = (content.timeLabels as boolean) || false;
  const checkboxes = (content.checkboxes as boolean) ?? true;
  const firstLabel = (content.firstLabel as string) || "First";
  const thenLabel = (content.thenLabel as string) || "Then";

  const isFirstThen = scheduleFormat === "first_then";
  const isScheduleBoard = scheduleFormat === "schedule_board";

  const updateContent = (updates: Record<string, unknown>) => {
    onUpdate({ generatedContent: { ...content, ...updates } });
  };

  const handleFormatChange = (newFormat: ScheduleFormat) => {
    updateContent({ scheduleFormat: newFormat });
    // Show notice if switching to first_then with >2 activities
    // (the PDF will only render the first 2)
  };

  const updateActivity = (
    index: number,
    field: keyof VisualScheduleActivity,
    value: string,
  ) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    const newContent = { ...content, activities: updated };

    if (field === "imagePrompt") {
      onUpdate({
        generatedContent: newContent,
        imageItems: state.imageItems.map((item) =>
          item.assetKey === `schedule_activity_icon:activity_${index}`
            ? { ...item, prompt: value }
            : item,
        ),
      });
    } else {
      onUpdate({ generatedContent: newContent });
    }
  };

  const addActivity = () => {
    if (isFirstThen && activities.length >= 2) return;

    const id = crypto.randomUUID();
    const newIndex = activities.length;
    const newActivity: VisualScheduleActivity = {
      id,
      name: "",
      imagePrompt: "",
      imageAssetKey: `schedule_activity_icon:activity_${newIndex}`,
    };
    const newActivities = [...activities, newActivity];

    onUpdate({
      generatedContent: { ...content, activities: newActivities },
      imageItems: [
        ...state.imageItems,
        {
          assetKey: `schedule_activity_icon:activity_${newIndex}`,
          assetType: "schedule_activity_icon",
          prompt: "Activity icon illustration",
          includeText: false,
          aspect: "1:1" as const,
          greenScreen: true,
          label: `Activity ${newIndex + 1}`,
          group: "Activity Icons",
          status: "pending" as const,
        },
      ],
    });
  };

  const removeActivity = (index: number) => {
    if (isFirstThen && activities.length <= 2) return;
    if (activities.length <= 1) return;

    const newActivities = activities.filter((_, i) => i !== index);

    // Rebuild activity icon image items with corrected indices
    const nonActivityItems = state.imageItems.filter(
      (item) => item.assetType !== "schedule_activity_icon",
    );
    const newActivityItems = newActivities.map((a, i) => ({
      assetKey: `schedule_activity_icon:activity_${i}`,
      assetType: "schedule_activity_icon",
      prompt: a.imagePrompt || `Icon for activity: ${a.name}`,
      includeText: false,
      aspect: "1:1" as const,
      greenScreen: true,
      label: a.name || `Activity ${i + 1}`,
      group: "Activity Icons",
      status: "pending" as const,
    }));

    // Update asset keys in content
    const updatedActivities = newActivities.map((a, i) => ({
      ...a,
      imageAssetKey: `schedule_activity_icon:activity_${i}`,
    }));

    onUpdate({
      generatedContent: { ...content, activities: updatedActivities },
      imageItems: [...nonActivityItems, ...newActivityItems],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Review and edit the AI-generated visual schedule before generating
          images.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-name" className="font-medium">
          Schedule Name
        </Label>
        <Input
          id="review-name"
          value={state.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          maxLength={100}
          placeholder="Visual schedule name"
        />
      </div>

      {/* Schedule Format */}
      <div className="space-y-2">
        <Label className="font-medium">Schedule Format</Label>
        <div className="flex gap-2">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFormatChange(opt.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg cursor-pointer",
                "transition-colors duration-150 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
                scheduleFormat === opt.value
                  ? "bg-coral text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
              aria-pressed={scheduleFormat === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2 max-w-md">
        <Label htmlFor="review-title" className="font-medium">
          Schedule Title
        </Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => updateContent({ title: e.target.value })}
          maxLength={100}
          placeholder="Title displayed on the schedule"
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
          placeholder="How to use this schedule"
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
                item.assetKey === "schedule_header"
                  ? {
                      ...item,
                      prompt: `Visual schedule header illustration: ${e.target.value}`,
                    }
                  : item,
              ),
            });
          }}
          placeholder="Describe the decorative header illustration"
          rows={2}
        />
      </div>

      {/* First-Then notice */}
      {isFirstThen && activities.length > 2 && (
        <div
          className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          First-Then boards use exactly 2 activities. Only the first 2
          activities will appear in the PDF.
        </div>
      )}

      {/* Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Activities ({activities.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addActivity}
            className="gap-1.5"
            disabled={isFirstThen && activities.length >= 2}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add Activity
          </Button>
        </div>

        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {isFirstThen
                  ? index === 0
                    ? firstLabel
                    : thenLabel
                  : `Activity ${index + 1}`}
              </span>
              {!(isFirstThen && activities.length <= 2) &&
                activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors duration-150 motion-reduce:transition-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                    aria-label={`Remove activity ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor={`activity-${index}-name`}
                  className="text-xs"
                >
                  Name
                </Label>
                <Input
                  id={`activity-${index}-name`}
                  value={activity.name}
                  onChange={(e) =>
                    updateActivity(index, "name", e.target.value)
                  }
                  placeholder="Activity name"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor={`activity-${index}-desc`}
                  className="text-xs"
                >
                  Description
                </Label>
                <Input
                  id={`activity-${index}-desc`}
                  value={activity.description || ""}
                  onChange={(e) =>
                    updateActivity(index, "description", e.target.value)
                  }
                  placeholder="What this activity involves"
                />
              </div>
            </div>

            {/* Time/duration for schedule_board */}
            {isScheduleBoard && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor={`activity-${index}-time`}
                    className="text-xs"
                  >
                    Time
                  </Label>
                  <Input
                    id={`activity-${index}-time`}
                    value={activity.time || ""}
                    onChange={(e) =>
                      updateActivity(index, "time", e.target.value)
                    }
                    placeholder="8:00 AM"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`activity-${index}-duration`}
                    className="text-xs"
                  >
                    Duration
                  </Label>
                  <Input
                    id={`activity-${index}-duration`}
                    value={activity.duration || ""}
                    onChange={(e) =>
                      updateActivity(index, "duration", e.target.value)
                    }
                    placeholder="15 min"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label
                htmlFor={`activity-${index}-prompt`}
                className="text-xs"
              >
                Icon Image Prompt
              </Label>
              <Textarea
                id={`activity-${index}-prompt`}
                value={activity.imagePrompt || ""}
                onChange={(e) =>
                  updateActivity(index, "imagePrompt", e.target.value)
                }
                placeholder="Describe the icon illustration"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Format-specific fields */}
      {isScheduleBoard && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Schedule Board Settings
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="schedule-time-labels"
                checked={timeLabels}
                onCheckedChange={(v) =>
                  updateContent({ timeLabels: v === true })
                }
              />
              <Label htmlFor="schedule-time-labels" className="cursor-pointer">Show time column</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="schedule-checkboxes"
                checked={checkboxes}
                onCheckedChange={(v) =>
                  updateContent({ checkboxes: v === true })
                }
              />
              <Label htmlFor="schedule-checkboxes" className="cursor-pointer">Show checkboxes</Label>
            </div>
          </div>
        </div>
      )}

      {isFirstThen && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            First-Then Labels
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-label">First Label</Label>
              <Input
                id="first-label"
                value={firstLabel}
                onChange={(e) =>
                  updateContent({ firstLabel: e.target.value })
                }
                placeholder="First"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="then-label">Then Label</Label>
              <Input
                id="then-label"
                value={thenLabel}
                onChange={(e) =>
                  updateContent({ thenLabel: e.target.value })
                }
                placeholder="Then"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
