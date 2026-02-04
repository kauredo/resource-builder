import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
  },
  handler: async (ctx, args) => {
    const { styleId, ...updates } = args;
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(styleId, filteredUpdates);
  },
});

export const deleteStyle = mutation({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.styleId);
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
