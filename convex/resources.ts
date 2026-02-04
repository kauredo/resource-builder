import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserResources = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resources")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getResourcesByType = query({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("emotion_cards"),
      v.literal("board_game"),
      v.literal("worksheet"),
      v.literal("poster"),
      v.literal("flashcards")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("resources")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const getResource = query({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.resourceId);
  },
});

export const createResource = mutation({
  args: {
    userId: v.id("users"),
    styleId: v.id("styles"),
    type: v.union(
      v.literal("emotion_cards"),
      v.literal("board_game"),
      v.literal("worksheet"),
      v.literal("poster"),
      v.literal("flashcards")
    ),
    name: v.string(),
    description: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("resources", {
      ...args,
      images: [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateResource = mutation({
  args: {
    resourceId: v.id("resources"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.any()),
    status: v.optional(v.union(v.literal("draft"), v.literal("complete"))),
    pdfStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { resourceId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );
    await ctx.db.patch(resourceId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const addImageToResource = mutation({
  args: {
    resourceId: v.id("resources"),
    storageId: v.id("_storage"),
    description: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new Error("Resource not found");

    const newImage = {
      storageId: args.storageId,
      description: args.description,
      prompt: args.prompt,
    };

    await ctx.db.patch(args.resourceId, {
      images: [...resource.images, newImage],
      updatedAt: Date.now(),
    });
  },
});

export const deleteResource = mutation({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.resourceId);
  },
});

// Get resource with resolved image URLs
export const getResourceWithImages = query({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) return null;

    // Get URLs for all images
    const imagesWithUrls = await Promise.all(
      resource.images.map(async (image) => ({
        ...image,
        url: await ctx.storage.getUrl(image.storageId),
      }))
    );

    return {
      ...resource,
      images: imagesWithUrls,
    };
  },
});
