"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewProps {
  /** Returns a PDF blob. Pass null while data is still loading. */
  generatePdf: (() => Promise<Blob>) | null;
  /** Controls visibility. Generation is deferred until first visible. */
  visible?: boolean;
  className?: string;
}

export function PDFPreview({ generatePdf, visible = true, className }: PDFPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const hasGeneratedRef = useRef(false);

  const generate = useCallback(async () => {
    if (!generatePdf) return;
    setIsGenerating(true);
    setError(null);
    try {
      const blob = await generatePdf();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const newUrl = URL.createObjectURL(blob);
      urlRef.current = newUrl;
      setUrl(newUrl);
      hasGeneratedRef.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to render preview");
    } finally {
      setIsGenerating(false);
    }
  }, [generatePdf]);

  // Generate on first visible, or when generatePdf becomes available while visible
  useEffect(() => {
    if (visible && generatePdf && !hasGeneratedRef.current) {
      generate();
    }
  }, [visible, generatePdf, generate]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  const heightClass = className?.match(/h-\[/) ? "" : "h-[600px]";

  if (!generatePdf || isGenerating) {
    return (
      <div
        className={`flex items-center justify-center border border-border/60 rounded-xl bg-muted/5 ${heightClass} ${className ?? ""}`}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2
            className="size-6 animate-spin motion-reduce:animate-none text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground">
            Rendering PDF…
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center border border-border/60 rounded-xl bg-muted/5 gap-3 ${heightClass} ${className ?? ""}`}
      >
        <span className="text-sm text-muted-foreground">{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          className="gap-1.5 cursor-pointer"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Retry
        </Button>
      </div>
    );
  }

  if (!url) return null;

  return (
    <div className={`relative ${className ?? ""}`}>
      <iframe
        src={url}
        className={`h-full w-full border border-border/60 rounded-xl bg-white ${heightClass}`}
        title="PDF Preview"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={generate}
        className="absolute top-3 right-3 size-8 bg-background shadow-sm cursor-pointer"
        aria-label="Refresh preview"
      >
        <RefreshCw className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
