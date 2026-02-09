"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from "react-konva";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Plus, RotateCcw, RotateCw, Save, Trash2 } from "lucide-react";
import type { AssetRef } from "@/types";

interface EditorText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  rotation: number;
  width?: number;
}

export interface ImageEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetRef: AssetRef;
  imageUrl: string;
  aspectRatio?: number; // width / height
  title?: string;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*);base64/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function ImageEditorModalImpl({
  open,
  onOpenChange,
  assetRef,
  imageUrl,
  aspectRatio = 1,
  title = "Edit image",
}: ImageEditorModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 560, height: 560 });

  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageFit, setImageFit] = useState({ x: 0, y: 0, scale: 1 });
  const [texts, setTexts] = useState<EditorText[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Undo/redo for text layers only
  const [history, setHistory] = useState<EditorText[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyRef = useRef<EditorText[][]>([[]]);
  const historyIndexRef = useRef(0);

  const asset = useQuery(api.assets.getAsset, {
    ownerType: assetRef.ownerType,
    ownerId: assetRef.ownerId as any,
    assetType: assetRef.assetType,
    assetKey: assetRef.assetKey,
  });
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const createFromEdit = useMutation(api.assetVersions.createFromEdit);

  const currentPrompt = asset?.currentVersion?.prompt ?? "Edited asset";

  // Load image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImageElement(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate fit whenever image or stage size changes
  useEffect(() => {
    if (!imageElement) return;
    const fitScale = Math.min(
      stageSize.width / imageElement.naturalWidth,
      stageSize.height / imageElement.naturalHeight,
    );
    const scale = Math.min(fitScale, 1);
    setImageFit({
      x: (stageSize.width - imageElement.naturalWidth * scale) / 2,
      y: (stageSize.height - imageElement.naturalHeight * scale) / 2,
      scale,
    });
  }, [imageElement, stageSize]);

  // Measure container for stage sizing
  useEffect(() => {
    if (!containerRef.current || !open) return;
    const measure = () => {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();
      const available = width - 24; // p-3 padding
      const maxHeight = window.innerHeight * 0.55;
      let targetWidth = Math.max(280, available);
      let targetHeight = Math.round(targetWidth / aspectRatio);
      if (targetHeight > maxHeight) {
        targetHeight = Math.round(maxHeight);
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
      setStageSize({ width: targetWidth, height: targetHeight });
    };
    measure();
    const timer = setTimeout(measure, 250);
    return () => clearTimeout(timer);
  }, [aspectRatio, open]);

  // Reset state when modal opens
  useEffect(() => {
    if (!open) return;
    setTexts([]);
    setSelectedTextId(null);
    historyRef.current = [[]];
    historyIndexRef.current = 0;
    setHistory([[]]);
    setHistoryIndex(0);
  }, [open]);

  // Sync transformer to selected text node
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    const selectedNode = stage.findOne(`#text-${selectedTextId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode]);
      transformer.getLayer().batchDraw();
    } else {
      transformer.nodes([]);
    }
  }, [selectedTextId, texts]);

  const pushHistory = (nextTexts: EditorText[]) => {
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    const next = [...trimmed, nextTexts];
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
    setHistory(next);
    setHistoryIndex(next.length - 1);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const idx = historyIndex - 1;
    historyIndexRef.current = idx;
    setHistoryIndex(idx);
    setTexts(historyRef.current[idx]);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const idx = historyIndex + 1;
    historyIndexRef.current = idx;
    setHistoryIndex(idx);
    setTexts(historyRef.current[idx]);
  };

  const handleAddText = () => {
    const newText: EditorText = {
      id: crypto.randomUUID(),
      text: "New text",
      x: stageSize.width / 2 - 60,
      y: stageSize.height / 2 - 12,
      fontSize: 24,
      color: "#1A1A1A",
      rotation: 0,
      width: 200,
    };
    const nextTexts = [...texts, newText];
    setTexts(nextTexts);
    setSelectedTextId(newText.id);
    pushHistory(nextTexts);
  };

  const selectedText = texts.find((t) => t.id === selectedTextId) ?? null;

  const updateSelectedText = (updates: Partial<EditorText>) => {
    if (!selectedText) return;
    const nextTexts = texts.map((text) =>
      text.id === selectedText.id ? { ...text, ...updates } : text,
    );
    setTexts(nextTexts);
    pushHistory(nextTexts);
  };

  const handleDeleteSelected = () => {
    if (!selectedText) return;
    const nextTexts = texts.filter((t) => t.id !== selectedText.id);
    setTexts(nextTexts);
    setSelectedTextId(null);
    pushHistory(nextTexts);
  };

  const handleSave = async () => {
    if (!stageRef.current) return;
    setIsSaving(true);

    try {
      // Deselect to hide transformer handles from export
      setSelectedTextId(null);
      // Wait a frame for transformer to clear
      await new Promise((r) => requestAnimationFrame(r));

      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const blob = dataUrlToBlob(dataUrl);
      const uploadUrl = await generateUploadUrl();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      });
      const { storageId } = await response.json();

      await createFromEdit({
        ownerType: assetRef.ownerType,
        ownerId: assetRef.ownerId as any,
        assetType: assetRef.assetType,
        assetKey: assetRef.assetKey,
        storageId,
        prompt: currentPrompt,
        params: {
          editState: { texts, aspectRatio },
        },
        sourceVersionId: asset?.currentVersionId,
      });

      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = texts.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Add text overlays and save a new version.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
          {/* Canvas */}
          <div className="space-y-3 min-w-0">
            <div
              ref={containerRef}
              className="rounded-xl border bg-muted/20 p-3 overflow-hidden"
            >
              <Stage
                width={stageSize.width}
                height={stageSize.height}
                ref={stageRef}
                className="bg-white rounded-lg"
                onMouseDown={(e) => {
                  if (e.target === e.target.getStage()) {
                    setSelectedTextId(null);
                  }
                }}
              >
                <Layer>
                  {imageElement && (
                    <KonvaImage
                      image={imageElement}
                      x={imageFit.x}
                      y={imageFit.y}
                      scaleX={imageFit.scale}
                      scaleY={imageFit.scale}
                    />
                  )}
                  {texts.map((text) => (
                    <Text
                      id={`text-${text.id}`}
                      key={text.id}
                      text={text.text}
                      x={text.x}
                      y={text.y}
                      fontSize={text.fontSize}
                      fill={text.color}
                      rotation={text.rotation}
                      width={text.width}
                      draggable
                      onClick={() => setSelectedTextId(text.id)}
                      onTap={() => setSelectedTextId(text.id)}
                      onDragEnd={(e) => {
                        const nextTexts = texts.map((t) =>
                          t.id === text.id
                            ? { ...t, x: e.target.x(), y: e.target.y() }
                            : t,
                        );
                        setTexts(nextTexts);
                        pushHistory(nextTexts);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const nextTexts = texts.map((t) =>
                          t.id === text.id
                            ? {
                                ...t,
                                x: node.x(),
                                y: node.y(),
                                rotation: node.rotation(),
                                fontSize: Math.max(10, t.fontSize * scaleX),
                              }
                            : t,
                        );
                        node.scaleX(1);
                        node.scaleY(1);
                        setTexts(nextTexts);
                        pushHistory(nextTexts);
                      }}
                    />
                  ))}
                  <Transformer ref={transformerRef} rotateEnabled />
                </Layer>
              </Stage>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="gap-1.5"
              >
                <RotateCw className="size-3.5" aria-hidden="true" />
                Redo
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddText}
              className="w-full gap-1.5"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add text
            </Button>

            {selectedText ? (
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Text properties</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Delete text</span>
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Content
                  </Label>
                  <Input
                    value={selectedText.text}
                    onChange={(e) =>
                      updateSelectedText({ text: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Size
                    </Label>
                    <Input
                      type="number"
                      min={10}
                      max={96}
                      value={selectedText.fontSize}
                      onChange={(e) =>
                        updateSelectedText({
                          fontSize: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Color
                    </Label>
                    <Input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) =>
                        updateSelectedText({ color: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Rotation
                  </Label>
                  <Slider
                    value={[selectedText.rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={([rotation]) =>
                      updateSelectedText({ rotation })
                    }
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                {texts.length === 0
                  ? "Add a text layer to get started"
                  : "Click a text layer to edit it"}
              </p>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={cn("btn-coral gap-2 flex-1")}
                disabled={!imageElement || !hasChanges || isSaving}
              >
                {isSaving ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
