"use client";

import Image from "next/image";

interface FramePreviewProps {
  url: string | null;
  alt: string;
  aspectRatio?: string;
  size?: "sm" | "md" | "lg";
}

export function FramePreview({
  url,
  alt,
  aspectRatio = "aspect-square",
  size = "md",
}: FramePreviewProps) {
  const sizeClasses = {
    sm: "max-w-[100px]",
    md: "max-w-[160px]",
    lg: "w-full",
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto h-full`}>
      {/* Transparency grid with softer colors */}
      <div
        className={`relative ${aspectRatio} rounded-md overflow-hidden`}
        style={{
          backgroundImage: `
            linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
            linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
          `,
          backgroundSize: "10px 10px",
          backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
          backgroundColor: "#ffffff",
        }}
      >
        {url ? (
          <Image
            src={url}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100px, (max-width: 1024px) 160px, 280px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="size-8 mx-auto mb-1 rounded border-2 border-dashed border-muted-foreground/20" />
              <span className="text-[10px] text-muted-foreground/50">
                Empty
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
