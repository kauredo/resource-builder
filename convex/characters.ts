import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserCharacters = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get all characters with first reference image URL resolved (for list page)
export const getUserCharactersWithThumbnails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      characters.map(async (character) => {
        let thumbnailUrl: string | null = null;
        const primaryId =
          character.primaryImageId ?? character.referenceImages[0];
        if (primaryId) {
          thumbnailUrl = await ctx.storage.getUrl(primaryId);
        }
        return { ...character, thumbnailUrl };
      })
    );
  },
});

// Get characters by style with thumbnails (for style detail page)
export const getCharactersByStyle = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();

    return await Promise.all(
      characters.map(async (character) => {
        let thumbnailUrl: string | null = null;
        const primaryId =
          character.primaryImageId ?? character.referenceImages[0];
        if (primaryId) {
          thumbnailUrl = await ctx.storage.getUrl(primaryId);
        }
        return { ...character, thumbnailUrl };
      })
    );
  },
});

// Count characters for a style (for badge display)
export const getCharacterCountByStyle = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();
    return characters.length;
  },
});

export const getCharacter = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.characterId);
  },
});

// Get character with all reference image URLs resolved
export const getCharacterWithImageUrls = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);
    if (!character) return null;

    const urlEntries = await Promise.all(
      character.referenceImages.map(async (storageId) => [
        storageId,
        await ctx.storage.getUrl(storageId),
      ] as const)
    );
    const imageUrls: Record<string, string | null> = Object.fromEntries(urlEntries);

    return { ...character, imageUrls };
  },
});

export const createCharacter = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    styleId: v.optional(v.id("styles")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("characters", {
      userId: args.userId,
      name: args.name,
      styleId: args.styleId,
      description: "",
      personality: "",
      referenceImages: [],
      promptFragment: "",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    styleId: v.optional(v.id("styles")),
    primaryImageId: v.optional(v.id("_storage")),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    personality: v.optional(v.string()),
    promptFragment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { characterId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    const now = Date.now();
    await ctx.db.patch(characterId, {
      ...filteredUpdates,
      updatedAt: now,
      // Track when visual description was last set for staleness detection
      ...(args.promptFragment !== undefined
        ? { promptFragmentUpdatedAt: now }
        : {}),
    });
  },
});

export const deleteCharacter = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);
    if (character) {
      // Delete all reference images from storage
      for (const storageId of character.referenceImages) {
        await ctx.storage.delete(storageId);
      }
    }
    await ctx.db.delete(args.characterId);
  },
});

// Generate an upload URL for client-side file uploads
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Add a reference image to a character
export const addReferenceImage = mutation({
  args: {
    characterId: v.id("characters"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);
    if (!character) throw new Error("Character not found");

    await ctx.db.patch(args.characterId, {
      referenceImages: [...character.referenceImages, args.storageId],
      ...(character.primaryImageId ? {} : { primaryImageId: args.storageId }),
      updatedAt: Date.now(),
    });
  },
});

// Update stored image descriptions
export const updateImageDescriptions = mutation({
  args: {
    characterId: v.id("characters"),
    imageDescriptions: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.characterId, {
      imageDescriptions: args.imageDescriptions,
    });
  },
});

// Remove a reference image from a character
export const removeReferenceImage = mutation({
  args: {
    characterId: v.id("characters"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const character = await ctx.db.get(args.characterId);
    if (!character) throw new Error("Character not found");

    // Remove from array and clean up stored description
    const updatedImages = character.referenceImages.filter(
      (id) => id !== args.storageId
    );
    const updatedDescriptions = { ...(character.imageDescriptions ?? {}) };
    delete updatedDescriptions[args.storageId];
    const shouldClearPrimary = character.primaryImageId === args.storageId;
    await ctx.db.patch(args.characterId, {
      referenceImages: updatedImages,
      imageDescriptions: updatedDescriptions,
      primaryImageId: shouldClearPrimary
        ? updatedImages[0]
        : character.primaryImageId,
      updatedAt: Date.now(),
    });

    // Delete from storage
    await ctx.storage.delete(args.storageId);
  },
});
