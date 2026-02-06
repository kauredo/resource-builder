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
        if (character.referenceImages.length > 0) {
          thumbnailUrl = await ctx.storage.getUrl(character.referenceImages[0]);
        }
        return { ...character, thumbnailUrl };
      })
    );
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

    const imageUrls: Record<string, string | null> = {};
    for (const storageId of character.referenceImages) {
      imageUrls[storageId] = await ctx.storage.getUrl(storageId);
    }

    return { ...character, imageUrls };
  },
});

export const createCharacter = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("characters", {
      userId: args.userId,
      name: args.name,
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
    await ctx.db.patch(characterId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
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
      updatedAt: Date.now(),
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

    // Remove from array
    const updatedImages = character.referenceImages.filter(
      (id) => id !== args.storageId
    );
    await ctx.db.patch(args.characterId, {
      referenceImages: updatedImages,
      updatedAt: Date.now(),
    });

    // Delete from storage
    await ctx.storage.delete(args.storageId);
  },
});
