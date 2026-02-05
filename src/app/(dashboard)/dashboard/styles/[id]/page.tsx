"use client";

import { useState, useCallback, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StyleEditor } from "@/components/style/StyleEditor";
import { FrameGenerator } from "@/components/style/FrameGenerator";
import {
  ArrowLeft,
  Lock,
  Copy,
  Trash2,
  Loader2,
  Check,
  Plus,
  Calendar,
} from "lucide-react";
import type { StyleFrames, FrameType } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StyleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [duplicateName, setDuplicateName] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const styleId = resolvedParams.id as Id<"styles">;
  const style = useQuery(api.styles.getStyleWithFrameUrls, { styleId });
  const updateStyle = useMutation(api.styles.updateStyle);
  const duplicateStyle = useMutation(api.styles.duplicateStyle);
  const deleteStyle = useMutation(api.styles.deleteStyle);

  const handleStyleChange = useCallback(
    async (updates: {
      name?: string;
      colors?: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
      };
      typography?: {
        headingFont: string;
        bodyFont: string;
      };
      illustrationStyle?: string;
    }) => {
      if (!style || style.isPreset) return;

      setSaveStatus("saving");
      try {
        await updateStyle({
          styleId,
          ...updates,
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to update style:", error);
        setSaveStatus("idle");
      }
    },
    [style, styleId, updateStyle]
  );

  const handleDuplicate = async () => {
    if (!style) return;

    setIsDuplicating(true);
    try {
      const newName = duplicateName.trim() || `${style.name} (Copy)`;
      const newStyleId = await duplicateStyle({
        styleId,
        newName,
      });
      router.push(`/dashboard/styles/${newStyleId}`);
    } catch (error) {
      console.error("Failed to duplicate style:", error);
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!style || style.isPreset) return;

    setIsDeleting(true);
    try {
      await deleteStyle({ styleId });
      router.push("/dashboard/styles");
    } catch (error) {
      console.error("Failed to delete style:", error);
      setIsDeleting(false);
    }
  };

  const openDuplicateDialog = () => {
    if (style) {
      setDuplicateName(`${style.name} (Copy)`);
      setShowDuplicateDialog(true);
    }
  };

  // Loading state
  if (style === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label="Loading style">
        <div className="mb-8" aria-hidden="true">
          <div className="h-4 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse motion-reduce:animate-none mb-2" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-9 w-20 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </div>
        <div className="space-y-8" aria-hidden="true">
          <div className="h-40 bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
          <div className="h-32 bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
          <div className="h-24 bg-muted rounded-xl animate-pulse motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  // Not found state
  if (style === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <h1 className="font-serif text-2xl font-medium mb-2">Style not found</h1>
          <p className="text-muted-foreground mb-6">
            This style may have been deleted or doesn&apos;t exist.
          </p>
          <Button asChild className="btn-coral">
            <Link href="/dashboard/styles">Back to Styles</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/styles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-150 mb-4 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Styles
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
                {style.name}
              </h1>
              {style.isPreset && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  <Lock className="size-3" aria-hidden="true" />
                  Preset
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" role="status">
                  <Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="inline-flex items-center gap-1 text-xs text-teal" role="status">
                  <Check className="size-3" aria-hidden="true" />
                  Saved
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {style.updatedAt && (
                <time
                  className="flex items-center gap-1.5"
                  dateTime={new Date(style.updatedAt).toISOString()}
                >
                  <Calendar className="size-4" aria-hidden="true" />
                  Updated {new Date(style.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Duplicate button */}
            <Button
              variant="outline"
              onClick={openDuplicateDialog}
              className="gap-2"
            >
              <Copy className="size-4" aria-hidden="true" />
              {style.isPreset ? "Customize" : "Duplicate"}
            </Button>

            {/* Use in new resource */}
            <Button asChild className="btn-coral gap-2">
              <Link href={`/dashboard/resources/new/emotion-cards?styleId=${styleId}`}>
                <Plus className="size-4" aria-hidden="true" />
                Use Style
              </Link>
            </Button>

            {/* Delete button - only for custom styles */}
            {!style.isPreset && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-muted-foreground hover:text-destructive hover:border-destructive/40">
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Delete style</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this style?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{style.name}&rdquo; and all its frame assets.
                      Resources using this style will still work but won&apos;t be able to regenerate images.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
                    >
                      {isDeleting && (
                        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      )}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Style preview hero - visual continuity with list page */}
      <div
        className="relative h-24 sm:h-32 mb-8 rounded-lg overflow-hidden transition-colors duration-200"
        style={{ backgroundColor: style.colors.background }}
      >
        {/* Organic shapes echoing StyleCard */}
        <div
          className="absolute -bottom-12 -left-12 w-40 h-40 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-90 transition-colors duration-200"
          style={{ backgroundColor: style.colors.primary }}
        />
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] opacity-85 transition-colors duration-200"
          style={{ backgroundColor: style.colors.secondary }}
        />
        <div
          className="absolute top-1/2 right-12 w-16 h-16 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] transition-colors duration-200"
          style={{ backgroundColor: style.colors.accent }}
        />
        {/* Preset badge overlay */}
        {style.isPreset && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              onClick={openDuplicateDialog}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/95 hover:bg-white text-sm font-medium text-foreground shadow-lg cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              <Lock className="size-4" aria-hidden="true" />
              Preset — Click to customize
            </button>
          </div>
        )}
      </div>

      {/* Style Editor */}
      <div className="space-y-12">
        <section>
          <StyleEditor
            name={style.name}
            colors={style.colors}
            typography={style.typography}
            illustrationStyle={style.illustrationStyle}
            onChange={handleStyleChange}
            disabled={style.isPreset}
          />
        </section>

        {/* Frame Generator - only for custom styles */}
        {!style.isPreset && (
          <section className="pt-8 border-t border-border">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-foreground">Frame Assets</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generate decorative frames to enhance your emotion cards. These are reused across all resources using this style.
              </p>
            </div>
            <FrameGenerator
              styleId={styleId}
              style={{
                colors: style.colors,
                illustrationStyle: style.illustrationStyle,
              }}
              frames={style.frames as StyleFrames | undefined}
              frameUrls={style.frameUrls}
            />
          </section>
        )}
      </div>

      {/* Duplicate Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {style.isPreset ? "Customize this preset" : "Duplicate this style"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {style.isPreset
                ? "Create an editable copy of this preset style with your own name."
                : "Create a copy of this style that you can modify independently."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="New style name"
              className="w-full"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicate}
              disabled={isDuplicating || !duplicateName.trim()}
              className="btn-coral gap-2"
            >
              {isDuplicating && (
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              )}
              {style.isPreset ? "Create Custom Style" : "Duplicate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
