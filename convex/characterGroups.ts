import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characterGroups")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserGroupsWithThumbnails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const groups = await ctx.db
      .query("characterGroups")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Collect all unique character IDs needed (max 4 per group)
    const allCharIds: Id<"characters">[] = [];
    const seen = new Set<string>();
    for (const group of groups) {
      for (const charId of group.characterIds.slice(0, 4)) {
        if (!seen.has(charId)) {
          seen.add(charId);
          allCharIds.push(charId);
        }
      }
    }

    // Batch fetch all characters + resolve URLs in parallel
    const charWithUrls = await Promise.all(
      allCharIds.map(async (charId) => {
        const character = await ctx.db.get(charId);
        if (!character) return { charId, url: null };
        const primaryId = character.primaryImageId ?? character.referenceImages[0];
        const url = primaryId ? await ctx.storage.getUrl(primaryId) : null;
        return { charId, url };
      })
    );
    const urlMap = new Map(charWithUrls.map(({ charId, url }) => [charId as string, url]));

    return groups.map((group) => ({
      ...group,
      thumbnails: group.characterIds.slice(0, 4).map((charId) => ({
        id: charId,
        url: urlMap.get(charId) ?? null,
      })),
    }));
  },
});

export const getGroup = query({
  args: { groupId: v.id("characterGroups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.groupId);
  },
});

export const getGroupWithCharacters = query({
  args: { groupId: v.id("characterGroups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    // Batch fetch all characters in parallel
    const charResults = await Promise.all(
      group.characterIds.map((charId) => ctx.db.get(charId)),
    );

    // Batch resolve all thumbnail URLs in parallel
    const characters = await Promise.all(
      charResults.map(async (character) => {
        if (!character) return null;
        const primaryId =
          character.primaryImageId ?? character.referenceImages[0];
        const thumbnailUrl = primaryId
          ? await ctx.storage.getUrl(primaryId)
          : null;
        return { ...character, thumbnailUrl };
      }),
    );

    return {
      ...group,
      characters: characters.filter(Boolean),
    };
  },
});

export const createGroup = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    sharedStyleId: v.optional(v.id("styles")),
    characterIds: v.array(v.id("characters")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("characterGroups", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      sharedStyleId: args.sharedStyleId,
      characterIds: args.characterIds,
      createdAt: now,
    });
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("characterGroups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sharedStyleId: v.optional(v.id("styles")),
    characterIds: v.optional(v.array(v.id("characters"))),
  },
  handler: async (ctx, args) => {
    const { groupId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch(groupId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("characterGroups") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.groupId);
  },
});

export const addCharacterToGroup = mutation({
  args: {
    groupId: v.id("characterGroups"),
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (!group.characterIds.includes(args.characterId)) {
      await ctx.db.patch(args.groupId, {
        characterIds: [...group.characterIds, args.characterId],
        updatedAt: Date.now(),
      });
    }
  },
});

export const removeCharacterFromGroup = mutation({
  args: {
    groupId: v.id("characterGroups"),
    characterId: v.id("characters"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    await ctx.db.patch(args.groupId, {
      characterIds: group.characterIds.filter(
        (id) => id !== args.characterId,
      ),
      updatedAt: Date.now(),
    });
  },
});
