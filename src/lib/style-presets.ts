import { StylePreset } from "@/types";

export const STYLE_PRESETS: StylePreset[] = [
  {
    name: "Warm & Playful",
    colors: {
      primary: "#FF6B6B", // Coral red
      secondary: "#4ECDC4", // Teal
      accent: "#FFE66D", // Sunny yellow
      background: "#FFF9F0", // Warm cream
      text: "#2C3E50", // Dark slate
    },
    typography: {
      headingFont: "Nunito",
      bodyFont: "Open Sans",
    },
    illustrationStyle:
      "Soft rounded shapes, warm pastel colors, friendly expressions, gentle gradients, child-friendly cartoon style, no sharp edges, cozy and inviting atmosphere",
  },
  {
    name: "Calm & Minimal",
    colors: {
      primary: "#6B9080", // Sage green
      secondary: "#A4C3B2", // Light sage
      accent: "#CCE3DE", // Mint
      background: "#F6FFF8", // Off-white green
      text: "#344E41", // Forest
    },
    typography: {
      headingFont: "Quicksand",
      bodyFont: "Lato",
    },
    illustrationStyle:
      "Simple line art, minimalist design, soft muted colors, plenty of white space, clean and calming, zen-like simplicity, gentle curves",
  },
  {
    name: "Bold & Colorful",
    colors: {
      primary: "#7400B8", // Purple
      secondary: "#5390D9", // Blue
      accent: "#56CFE1", // Cyan
      background: "#FFFFFF", // White
      text: "#1A1A2E", // Near black
    },
    typography: {
      headingFont: "Poppins",
      bodyFont: "Inter",
    },
    illustrationStyle:
      "Bold vibrant colors, high contrast, energetic and dynamic, playful geometric shapes, strong outlines, modern and eye-catching",
  },
  {
    name: "Nature & Earthy",
    colors: {
      primary: "#606C38", // Olive
      secondary: "#283618", // Dark green
      accent: "#DDA15E", // Tan
      background: "#FEFAE0", // Cream
      text: "#3D405B", // Slate
    },
    typography: {
      headingFont: "Merriweather",
      bodyFont: "Source Sans Pro",
    },
    illustrationStyle:
      "Nature-inspired, organic shapes, animals and plants, earthy warm tones, hand-drawn feel, woodland creatures, gentle and grounding",
  },
  {
    name: "Whimsical Fantasy",
    colors: {
      primary: "#E0AAFF", // Lavender
      secondary: "#C77DFF", // Purple
      accent: "#9D4EDD", // Deep purple
      background: "#FFF0F5", // Lavender blush
      text: "#4A4063", // Dark purple
    },
    typography: {
      headingFont: "Baloo 2",
      bodyFont: "Rubik",
    },
    illustrationStyle:
      "Magical and dreamy, soft pastels with sparkles, fantasy creatures, clouds and stars, whimsical and enchanting, fairy-tale like, gentle magical glow",
  },
];
