// Single source of truth for preset style definitions (backend).
// Frontend equivalent: src/lib/style-presets.ts
export const PRESET_STYLES = [
  {
    name: "Warm & Playful",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
      accent: "#FFE66D",
      background: "#FFF9F0",
      text: "#2C3E50",
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
      primary: "#6B9080",
      secondary: "#A4C3B2",
      accent: "#CCE3DE",
      background: "#F6FFF8",
      text: "#344E41",
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
      primary: "#E63946",
      secondary: "#1D3557",
      accent: "#F4A261",
      background: "#FFFFFF",
      text: "#1A1A2E",
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
      primary: "#606C38",
      secondary: "#283618",
      accent: "#DDA15E",
      background: "#FEFAE0",
      text: "#3D405B",
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
      primary: "#F4A0C4",
      secondary: "#7EC8E3",
      accent: "#FFD166",
      background: "#FFF8F0",
      text: "#3D3655",
    },
    typography: {
      headingFont: "Baloo 2",
      bodyFont: "Quicksand",
    },
    illustrationStyle:
      "Whimsical fairy-tale illustrations with soft watercolor textures, gentle curves, dreamy pastel atmosphere, storybook quality, imaginative creatures, hand-painted feel",
  },
];
