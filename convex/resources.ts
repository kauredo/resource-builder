import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getUserResources = query({
  args: {
    userId: v.id("users"),
    type: v.optional(
      v.union(
        v.literal("emotion_cards"),
        v.literal("board_game"),
        v.literal("card_game"),
        v.literal("free_prompt"),
        v.literal("worksheet"),
        v.literal("poster"),
        v.literal("flashcards"),
      ),
    ),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let resources = await ctx.db
      .query("resources")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.type) {
      resources = resources.filter((resource) => resource.type === args.type);
    }

    if (args.tag) {
      resources = resources.filter((resource) =>
        (resource.tags ?? []).includes(args.tag as string),
      );
    }

    // Get thumbnail URL for first asset (fallback to legacy images)
    const resourcesWithThumbnails = await Promise.all(
      resources.map(async (resource) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resource._id),
          )
          .collect();

        let thumbnailUrl: string | null = null;
        const assetCount = assets.length;

        // Sort by most recently updated so we pick current-gen assets
        const versioned = assets
          .filter((a) => a.currentVersionId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
        // For card games, prefer the newest background asset
        const thumbAsset =
          (resource.type === "card_game"
            ? versioned.find((a) => a.assetType === "card_bg")
            : undefined) ?? versioned[0];
        if (thumbAsset?.currentVersionId) {
          const currentVersion = await ctx.db.get(
            thumbAsset.currentVersionId,
          );
          if (currentVersion) {
            thumbnailUrl = await ctx.storage.getUrl(currentVersion.storageId);
          }
        }
        return {
          ...resource,
          thumbnailUrl,
          assetCount,
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
      v.literal("card_game"),
      v.literal("free_prompt"),
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

// Get resources by style with thumbnails (for style detail page)
export const getResourcesByStyle = query({
  args: { styleId: v.id("styles") },
  handler: async (ctx, args) => {
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();

    return await Promise.all(
      resources.map(async (resource) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resource._id),
          )
          .collect();

        let thumbnailUrl: string | null = null;
        const assetCount = assets.length;

        const versioned = assets
          .filter((a) => a.currentVersionId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
        const thumbAsset =
          (resource.type === "card_game"
            ? versioned.find((a) => a.assetType === "card_bg")
            : undefined) ?? versioned[0];
        if (thumbAsset?.currentVersionId) {
          const currentVersion = await ctx.db.get(
            thumbAsset.currentVersionId,
          );
          if (currentVersion) {
            thumbnailUrl = await ctx.storage.getUrl(currentVersion.storageId);
          }
        }
        return { ...resource, thumbnailUrl, assetCount };
      })
    );
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
      v.literal("card_game"),
      v.literal("free_prompt"),
      v.literal("worksheet"),
      v.literal("poster"),
      v.literal("flashcards")
    ),
    name: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("resources", {
      ...args,
      images: [],
      tags: args.tags ?? [],
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
    tags: v.optional(v.array(v.string())),
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

    // Prefer assets if they exist (emotion cards use assetKey emotion:*)
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", "resource").eq("ownerId", resource._id),
      )
      .collect();

    let imagesWithUrls = [] as Array<{
      storageId: Id<"_storage">;
      description: string;
      prompt: string;
      url: string | null;
    }>;

    imagesWithUrls = await Promise.all(
      assets
        .filter((asset) => asset.currentVersionId)
        .map(async (asset) => {
          const version = asset.currentVersionId
            ? await ctx.db.get(asset.currentVersionId)
            : null;
          const description = asset.assetKey.startsWith("emotion:")
            ? asset.assetKey.replace("emotion:", "")
            : asset.assetKey;
          return {
            storageId: version?.storageId as Id<"_storage">,
            description,
            prompt: version?.prompt ?? "",
            url: version
              ? await ctx.storage.getUrl(version.storageId)
              : null,
          };
        }),
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
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_owner", (q) =>
          q.eq("ownerType", "resource").eq("ownerId", resource._id),
        )
        .collect();

      const happyAsset = assets.find(
        (asset) => asset.assetKey.toLowerCase() === "emotion:happy",
      );
      if (happyAsset?.currentVersionId) {
        const version = await ctx.db.get(happyAsset.currentVersionId);
        if (version) {
          const url = await ctx.storage.getUrl(version.storageId);
          if (url) return { url, emotion: "Happy" };
        }
      }
    }

    // Second pass: return first available image
    for (const resource of resources) {
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_owner", (q) =>
          q.eq("ownerType", "resource").eq("ownerId", resource._id),
        )
        .collect();

      const assetWithCurrent = assets.find((a) => a.currentVersionId);
      if (assetWithCurrent?.currentVersionId) {
        const version = await ctx.db.get(assetWithCurrent.currentVersionId);
        if (version) {
          const url = await ctx.storage.getUrl(version.storageId);
          if (url) return { url, emotion: assetWithCurrent.assetKey };
        }
      }
    }

    return null;
  },
});
