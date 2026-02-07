"use client";

import dynamic from "next/dynamic";
import type { ImageEditorModalProps } from "./ImageEditorModalImpl";

const ImageEditorModal = dynamic<ImageEditorModalProps>(
  () =>
    import("./ImageEditorModalImpl").then(
      (mod) => mod.ImageEditorModalImpl,
    ),
  { ssr: false },
);

export { ImageEditorModal };
export type { ImageEditorModalProps };
