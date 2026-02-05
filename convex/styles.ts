import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Style presets - same as in src/lib/style-presets.ts
// Duplicated here because Convex backend can't import from src/
const STYLE_PRESETS = [
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
      primary: "#7400B8",
      secondary: "#5390D9",
      accent: "#56CFE1",
      background: "#FFFFFF",
      text: "#1A1A2E",
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
      primary: "#E0AAFF",
      secondary: "#C77DFF",
      accent: "#9D4EDD",
      background: "#FFF0F5",
      text: "#4A4063",
    },
    typography: {
      headingFont: "Baloo 2",
      bodyFont: "Rubik",
    },
    illustrationStyle:
      "Magical and dreamy, soft pastels with sparkles, fantasy creatures, clouds and stars, whimsical and enchanting, fairy-tale like, gentle magical glow",
  },
];

export const getUserStyles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("styles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getStyle = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.styleId);
  },
});

export const createStyle = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    isPreset: v.boolean(),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
    }),
    typography: v.object({
      headingFont: v.string(),
      bodyFont: v.string(),
    }),
    illustrationStyle: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("styles", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateStyle = mutation({
  args: {
    styleId: v.id("styles"),
    name: v.optional(v.string()),
    colors: v.optional(
      v.object({
        primary: v.string(),
        secondary: v.string(),
        accent: v.string(),
        background: v.string(),
        text: v.string(),
      })
    ),
    typography: v.optional(
      v.object({
        headingFont: v.string(),
        bodyFont: v.string(),
      })
    ),
    illustrationStyle: v.optional(v.string()),
    frames: v.optional(
      v.object({
        border: v.optional(
          v.object({
            storageId: v.id("_storage"),
            prompt: v.string(),
            generatedAt: v.number(),
          })
        ),
        divider: v.optional(
          v.object({
            storageId: v.id("_storage"),
            prompt: v.string(),
            generatedAt: v.number(),
          })
        ),
        textBacking: v.optional(
          v.object({
            storageId: v.id("_storage"),
            prompt: v.string(),
            generatedAt: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { styleId, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    // Always update the updatedAt timestamp
    await ctx.db.patch(styleId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteStyle = mutation({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.styleId);
  },
});

// Get style with resolved frame URLs
export const getStyleWithFrameUrls = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) return null;

    // Resolve frame URLs if frames exist
    let frameUrls: {
      border?: string | null;
      divider?: string | null;
      textBacking?: string | null;
    } = {};

    if (style.frames) {
      if (style.frames.border?.storageId) {
        frameUrls.border = await ctx.storage.getUrl(style.frames.border.storageId);
      }
      if (style.frames.divider?.storageId) {
        frameUrls.divider = await ctx.storage.getUrl(style.frames.divider.storageId);
      }
      if (style.frames.textBacking?.storageId) {
        frameUrls.textBacking = await ctx.storage.getUrl(style.frames.textBacking.storageId);
      }
    }

    return {
      ...style,
      frameUrls,
    };
  },
});

// Duplicate a style for customization
export const duplicateStyle = mutation({
  args: {
    styleId: v.id("styles"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.styleId);
    if (!original) {
      throw new Error("Style not found");
    }

    // Create a copy without frames (they need to be regenerated)
    const newStyleId = await ctx.db.insert("styles", {
      userId: original.userId,
      name: args.newName,
      isPreset: false, // Duplicated styles are always custom
      colors: original.colors,
      typography: original.typography,
      illustrationStyle: original.illustrationStyle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newStyleId;
  },
});

// Seed all preset styles for a new user (and clean up duplicates)
export const seedUserPresets = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all existing presets for the user
    const existingPresets = await ctx.db
      .query("styles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isPreset"), true))
      .collect();

    // Group presets by name to find duplicates
    const presetsByName = new Map<string, typeof existingPresets>();
    for (const preset of existingPresets) {
      const existing = presetsByName.get(preset.name) ?? [];
      existing.push(preset);
      presetsByName.set(preset.name, existing);
    }

    // Remove duplicate presets (keep the oldest one)
    for (const [, presets] of presetsByName) {
      if (presets.length > 1) {
        // Sort by createdAt ascending, keep the first (oldest)
        presets.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
        // Delete all but the first
        for (let i = 1; i < presets.length; i++) {
          await ctx.db.delete(presets[i]._id);
        }
      }
    }

    // Get updated list of existing preset names
    const existingNames = new Set(presetsByName.keys());

    // Create any missing presets
    const now = Date.now();
    for (const preset of STYLE_PRESETS) {
      if (!existingNames.has(preset.name)) {
        await ctx.db.insert("styles", {
          userId: args.userId,
          name: preset.name,
          isPreset: true,
          colors: preset.colors,
          typography: preset.typography,
          illustrationStyle: preset.illustrationStyle,
          createdAt: now,
        });
      }
    }
  },
});

// Get or create a preset style (avoids duplicates when clicking presets)
export const getOrCreatePresetStyle = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
    }),
    typography: v.object({
      headingFont: v.string(),
      bodyFont: v.string(),
    }),
    illustrationStyle: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if this preset already exists for the user
    const existing = await ctx.db
      .query("styles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(q.eq(q.field("name"), args.name), q.eq(q.field("isPreset"), true))
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new preset style
    return await ctx.db.insert("styles", {
      ...args,
      isPreset: true,
      createdAt: Date.now(),
    });
  },
});
