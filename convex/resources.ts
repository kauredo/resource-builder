import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserResources = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get thumbnail URL for first image of each resource
    const resourcesWithThumbnails = await Promise.all(
      resources.map(async (resource) => {
        const thumbnailUrl = resource.images.length > 0
          ? await ctx.storage.getUrl(resource.images[0].storageId)
          : null;
        return {
          ...resource,
          thumbnailUrl,
        };
      })
    );

    return resourcesWithThumbnails;
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

    // Remove any existing image with the same description (emotion) and delete from storage
    const existingImage = resource.images.find(
      (img) => img.description === args.description
    );
    if (existingImage) {
      await ctx.storage.delete(existingImage.storageId);
    }

    // Filter out the old image and add the new one
    const filteredImages = resource.images.filter(
      (img) => img.description !== args.description
    );

    await ctx.db.patch(args.resourceId, {
      images: [...filteredImages, newImage],
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

// Remove specific images from a resource (for edit mode emotion removal)
export const removeImagesFromResource = mutation({
  args: {
    resourceId: v.id("resources"),
    emotionsToRemove: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new Error("Resource not found");

    // Filter out images that match the emotions to remove
    const updatedImages = resource.images.filter(
      (img) => !args.emotionsToRemove.includes(img.description)
    );

    // Delete the storage files for removed images
    const imagesToDelete = resource.images.filter((img) =>
      args.emotionsToRemove.includes(img.description)
    );
    for (const img of imagesToDelete) {
      await ctx.storage.delete(img.storageId);
    }

    await ctx.db.patch(args.resourceId, {
      images: updatedImages,
      updatedAt: Date.now(),
    });
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

// Get a sample card image URL for a style (preferring "Happy" emotion)
export const getSampleImageForStyle = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    // Find resources using this style that have images
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();

    // Look for a "Happy" image first, then fall back to any image
    for (const resource of resources) {
      // First pass: look for "Happy"
      for (const image of resource.images) {
        if (image.description?.toLowerCase() === "happy") {
          const url = await ctx.storage.getUrl(image.storageId);
          if (url) return { url, emotion: "Happy" };
        }
      }
    }

    // Second pass: return first available image
    for (const resource of resources) {
      if (resource.images.length > 0) {
        const image = resource.images[0];
        const url = await ctx.storage.getUrl(image.storageId);
        if (url) return { url, emotion: image.description || "Card" };
      }
    }

    return null;
  },
});
