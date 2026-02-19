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
      primary: "#E63946", // Bright red
      secondary: "#1D3557", // Deep navy
      accent: "#F4A261", // Golden amber
      background: "#FFFFFF", // White
      text: "#1A1A2E", // Near black
    },
    typography: {
      headingFont: "Fredoka",
      bodyFont: "Nunito Sans",
    },
    illustrationStyle:
      "Bold graphic illustrations with high saturation, strong outlines, flat color blocks, dynamic compositions, confident shapes, print-friendly with high contrast",
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
      primary: "#F4A0C4", // Rose pink
      secondary: "#7EC8E3", // Sky blue
      accent: "#FFD166", // Golden
      background: "#FFF8F0", // Warm cream
      text: "#3D3655", // Dark plum
    },
    typography: {
      headingFont: "Baloo 2",
      bodyFont: "Quicksand",
    },
    illustrationStyle:
      "Whimsical fairy-tale illustrations with soft watercolor textures, gentle curves, dreamy pastel atmosphere, storybook quality, imaginative creatures, hand-painted feel",
  },
];
