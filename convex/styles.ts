import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { FREE_LIMITS, requireAdmin } from "./users";
import { PRESET_STYLES } from "./presetData";

// Returns user's custom styles + all shared presets
export const getUserStyles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const [customStyles, sharedPresets] = await Promise.all([
      ctx.db
        .query("styles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("styles")
        .withIndex("by_preset", (q) => q.eq("isPreset", true))
        .filter((q) => q.eq(q.field("userId"), undefined))
        .collect(),
    ]);
    return [...sharedPresets, ...customStyles];
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
    // Enforce free tier limit for custom styles
    const user = await ctx.db.get(args.userId);
    if (user && user.subscription !== "pro") {
      const existingStyles = await ctx.db
        .query("styles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      if (existingStyles.length >= FREE_LIMITS.styles) {
        throw new Error(
          "LIMIT_REACHED:style:You've reached your free plan limit of 1 custom style. Upgrade to Pro for unlimited styles."
        );
      }
    }

    return await ctx.db.insert("styles", {
      ...args,
      isPreset: false,
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
    cardLayout: v.optional(
      v.object({
        textPosition: v.optional(
          v.union(
            v.literal("bottom"),
            v.literal("overlay"),
            v.literal("integrated")
          )
        ),
        contentHeight: v.optional(v.number()),
        imageOverlap: v.optional(v.number()),
        borderWidth: v.optional(v.number()),
        borderColor: v.optional(v.string()),
      })
    ),
    framePromptSuffix: v.optional(v.string()),
    defaultUseFrames: v.optional(
      v.object({
        border: v.optional(v.boolean()),
        fullCard: v.optional(v.boolean()),
      })
    ),
    frames: v.optional(
      v.object({
        border: v.optional(
          v.object({
            storageId: v.id("_storage"),
            prompt: v.string(),
            generatedAt: v.number(),
          })
        ),
        fullCard: v.optional(
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

    // Guard: refuse to update presets
    const style = await ctx.db.get(styleId);
    if (style?.isPreset) {
      throw new Error("Cannot modify a preset style");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(styleId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteStyle = mutation({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    // Guard: refuse to delete presets
    const style = await ctx.db.get(args.styleId);
    if (style?.isPreset) {
      throw new Error("Cannot delete a preset style");
    }
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
    const frameUrls: {
      border?: string | null;
      fullCard?: string | null;
    } = {};

    if (style.frames) {
      if (style.frames.border?.storageId) {
        frameUrls.border = await ctx.storage.getUrl(style.frames.border.storageId);
      }
      if (style.frames.fullCard?.storageId) {
        frameUrls.fullCard = await ctx.storage.getUrl(style.frames.fullCard.storageId);
      }
    }

    return {
      ...style,
      frameUrls,
    };
  },
});

// Get style counts scoped to a specific user (important for shared presets)
export const getStyleSummary = query({
  args: {
    styleId: v.id("styles"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) return null;

    let characters;
    let resources;

    if (args.userId) {
      // Scoped counts: filter to this user only (needed for shared presets)
      const [allChars, allRes] = await Promise.all([
        ctx.db
          .query("characters")
          .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
          .collect(),
        ctx.db
          .query("resources")
          .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
          .collect(),
      ]);
      characters = allChars.filter((c) => c.userId === args.userId);
      resources = allRes.filter((r) => r.userId === args.userId);
    } else {
      [characters, resources] = await Promise.all([
        ctx.db
          .query("characters")
          .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
          .collect(),
        ctx.db
          .query("resources")
          .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
          .collect(),
      ]);
    }

    return {
      characterCount: characters.length,
      resourceCount: resources.length,
    };
  },
});

// Get all styles with character/resource counts (single query for listing page)
export const getUserStylesWithSummaries = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const [customStyles, sharedPresets, allCharacters, allResources] = await Promise.all([
      ctx.db
        .query("styles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("styles")
        .withIndex("by_preset", (q) => q.eq("isPreset", true))
        .filter((q) => q.eq(q.field("userId"), undefined))
        .collect(),
      ctx.db
        .query("characters")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
      ctx.db
        .query("resources")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
    ]);

    const styles = [...sharedPresets, ...customStyles];

    // Single-pass counting via Maps
    const charCounts = new Map<string, number>();
    for (const c of allCharacters) {
      if (c.styleId) charCounts.set(c.styleId, (charCounts.get(c.styleId) ?? 0) + 1);
    }
    const resCounts = new Map<string, number>();
    for (const r of allResources) {
      if (r.styleId) resCounts.set(r.styleId, (resCounts.get(r.styleId) ?? 0) + 1);
    }

    return styles.map((style) => ({
      ...style,
      characterCount: charCounts.get(style._id) ?? 0,
      resourceCount: resCounts.get(style._id) ?? 0,
    }));
  },
});

// Duplicate a style for customization
export const duplicateStyle = mutation({
  args: {
    styleId: v.id("styles"),
    userId: v.id("users"),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.styleId);
    if (!original) {
      throw new Error("Style not found");
    }

    // Enforce free tier limit (duplicated styles are always custom)
    const user = await ctx.db.get(args.userId);
    if (user && user.subscription !== "pro") {
      const existingStyles = await ctx.db
        .query("styles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      if (existingStyles.length >= FREE_LIMITS.styles) {
        throw new Error(
          "LIMIT_REACHED:style:You've reached your free plan limit of 1 custom style. Upgrade to Pro for unlimited styles."
        );
      }
    }

    // Create a copy without frames (they need to be regenerated)
    const newStyleId = await ctx.db.insert("styles", {
      userId: args.userId,
      name: args.newName,
      isPreset: false,
      colors: original.colors,
      typography: original.typography,
      illustrationStyle: original.illustrationStyle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newStyleId;
  },
});

// Seed shared system presets (idempotent — creates if missing, updates if drifted)
export const seedSystemPresets = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPresets = await ctx.db
      .query("styles")
      .withIndex("by_preset", (q) => q.eq("isPreset", true))
      .filter((q) => q.eq(q.field("userId"), undefined))
      .collect();

    const existingByName = new Map(existingPresets.map((p) => [p.name, p]));

    const now = Date.now();
    for (const preset of PRESET_STYLES) {
      const existing = existingByName.get(preset.name);
      if (!existing) {
        await ctx.db.insert("styles", {
          name: preset.name,
          isPreset: true,
          colors: preset.colors,
          typography: preset.typography,
          illustrationStyle: preset.illustrationStyle,
          createdAt: now,
        });
      } else if (
        existing.colors.primary !== preset.colors.primary ||
        existing.colors.secondary !== preset.colors.secondary ||
        existing.colors.accent !== preset.colors.accent ||
        existing.colors.background !== preset.colors.background ||
        existing.colors.text !== preset.colors.text ||
        existing.typography.headingFont !== preset.typography.headingFont ||
        existing.typography.bodyFont !== preset.typography.bodyFont ||
        existing.illustrationStyle !== preset.illustrationStyle
      ) {
        await ctx.db.patch(existing._id, {
          colors: preset.colors,
          typography: preset.typography,
          illustrationStyle: preset.illustrationStyle,
          updatedAt: now,
        });
      }
    }
  },
});

// Check if any per-user preset copies still exist (admin only)
export const hasPerUserPresets = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const perUserPreset = await ctx.db
      .query("styles")
      .withIndex("by_preset", (q) => q.eq("isPreset", true))
      .filter((q) => q.neq(q.field("userId"), undefined))
      .first();
    return perUserPreset !== null;
  },
});

// One-time migration: consolidate per-user preset copies into shared presets (admin only)
export const migratePresetsToShared = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // 1. Ensure shared presets exist
    let sharedPresets = await ctx.db
      .query("styles")
      .withIndex("by_preset", (q) => q.eq("isPreset", true))
      .filter((q) => q.eq(q.field("userId"), undefined))
      .collect();

    if (sharedPresets.length === 0) {
      const now = Date.now();
      for (const preset of PRESET_STYLES) {
        await ctx.db.insert("styles", {
          name: preset.name,
          isPreset: true,
          colors: preset.colors,
          typography: preset.typography,
          illustrationStyle: preset.illustrationStyle,
          createdAt: now,
        });
      }
      sharedPresets = await ctx.db
        .query("styles")
        .withIndex("by_preset", (q) => q.eq("isPreset", true))
        .filter((q) => q.eq(q.field("userId"), undefined))
        .collect();
    }

    // 2. Build name → shared ID map
    const sharedByName = new Map(sharedPresets.map((p) => [p.name, p._id]));

    // 3. Find all per-user preset copies
    const perUserPresets = await ctx.db
      .query("styles")
      .withIndex("by_preset", (q) => q.eq("isPreset", true))
      .filter((q) => q.neq(q.field("userId"), undefined))
      .collect();

    let remappedResources = 0;
    let remappedCharacters = 0;
    let remappedCharacterGroups = 0;
    let remappedAssets = 0;
    let deletedPresets = 0;
    let deletedStorageFiles = 0;

    // Pre-load all characters and character groups once (avoid O(N*M) in loop)
    const allChars = await ctx.db.query("characters").collect();
    const allGroups = await ctx.db.query("characterGroups").collect();

    // Fallback for orphaned presets (names no longer in PRESET_STYLES)
    const fallbackSharedId = sharedPresets[0]?._id;

    for (const oldPreset of perUserPresets) {
      const sharedId = sharedByName.get(oldPreset.name) ?? fallbackSharedId;
      if (!sharedId) continue; // No shared presets exist at all

      const oldId = oldPreset._id;

      // 3a. Remap resources
      const resources = await ctx.db
        .query("resources")
        .withIndex("by_style", (q) => q.eq("styleId", oldId))
        .collect();
      for (const r of resources) {
        await ctx.db.patch(r._id, { styleId: sharedId });
        remappedResources++;
      }

      // 3b. Remap characters (styleId + styledReferenceStyleId)
      const characters = await ctx.db
        .query("characters")
        .withIndex("by_style", (q) => q.eq("styleId", oldId))
        .collect();
      for (const c of characters) {
        const patch: Record<string, unknown> = { styleId: sharedId };
        if (c.styledReferenceStyleId === oldId) {
          patch.styledReferenceStyleId = sharedId;
        }
        await ctx.db.patch(c._id, patch);
        remappedCharacters++;
      }

      // Also remap characters that only have styledReferenceStyleId matching
      // (styleId might be different — loaded once outside loop)
      for (const c of allChars) {
        if (c.styledReferenceStyleId === oldId && c.styleId !== oldId) {
          await ctx.db.patch(c._id, { styledReferenceStyleId: sharedId });
        }
      }

      // 3b2. Remap character groups with sharedStyleId
      for (const g of allGroups) {
        if (g.sharedStyleId === oldId) {
          await ctx.db.patch(g._id, { sharedStyleId: sharedId });
          remappedCharacterGroups++;
        }
      }

      // 3c. Delete frame storage files from per-user copy
      if (oldPreset.frames?.border?.storageId) {
        try {
          await ctx.storage.delete(oldPreset.frames.border.storageId);
          deletedStorageFiles++;
        } catch { /* already deleted */ }
      }
      if (oldPreset.frames?.fullCard?.storageId) {
        try {
          await ctx.storage.delete(oldPreset.frames.fullCard.storageId);
          deletedStorageFiles++;
        } catch { /* already deleted */ }
      }

      // 3d. Delete assets + versions owned by per-user copy
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_owner", (q) => q.eq("ownerType", "style").eq("ownerId", oldId))
        .collect();
      for (const asset of assets) {
        const versions = await ctx.db
          .query("assetVersions")
          .withIndex("by_asset", (q) => q.eq("assetId", asset._id))
          .collect();
        for (const version of versions) {
          try {
            await ctx.storage.delete(version.storageId);
            deletedStorageFiles++;
          } catch { /* already deleted */ }
          await ctx.db.delete(version._id);
        }
        await ctx.db.delete(asset._id);
        remappedAssets++;
      }

      // 3e. Delete the per-user preset copy
      await ctx.db.delete(oldId);
      deletedPresets++;
    }

    return {
      remappedResources,
      remappedCharacters,
      remappedCharacterGroups,
      remappedAssets,
      deletedPresets,
      deletedStorageFiles,
    };
  },
});
