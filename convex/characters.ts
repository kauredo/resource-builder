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

export const getCharactersByStyle = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();
  },
});

export const getCharacter = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.characterId);
  },
});

export const createCharacter = mutation({
  args: {
    userId: v.id("users"),
    styleId: v.id("styles"),
    name: v.string(),
    description: v.string(),
    personality: v.string(),
    referenceImages: v.array(v.id("_storage")),
    promptFragment: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("characters", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    personality: v.optional(v.string()),
    referenceImages: v.optional(v.array(v.id("_storage"))),
    promptFragment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { characterId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(characterId, filteredUpdates);
  },
});

export const deleteCharacter = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.characterId);
  },
});
