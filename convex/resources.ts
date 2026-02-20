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
        v.literal("book"),
      ),
    ),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
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

    // Apply limit if specified (e.g., dashboard only needs 6)
    if (args.limit) {
      resources.sort((a, b) => b.updatedAt - a.updatedAt);
      resources = resources.slice(0, args.limit);
    }

    // Batch: fetch all assets for all resources in parallel
    const allAssetsPerResource = await Promise.all(
      resources.map((resource) =>
        ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resource._id),
          )
          .collect()
      )
    );

    // Batch: resolve thumbnail version + URL in parallel
    const thumbnails = await Promise.all(
      resources.map(async (resource, i) => {
        const assets = allAssetsPerResource[i];
        const versioned = assets
          .filter((a) => a.currentVersionId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
        const thumbAsset =
          (resource.type === "card_game"
            ? versioned.find((a) => a.assetType === "card_bg")
            : undefined) ?? versioned[0];

        if (!thumbAsset?.currentVersionId) return { url: null, count: assets.length };
        const version = await ctx.db.get(thumbAsset.currentVersionId);
        const url = version ? await ctx.storage.getUrl(version.storageId) : null;
        return { url, count: assets.length };
      })
    );

    return resources.map((resource, i) => ({
      ...resource,
      thumbnailUrl: thumbnails[i].url,
      assetCount: thumbnails[i].count,
    }));
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
      v.literal("flashcards"),
      v.literal("book")
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

    // Batch: fetch all assets for all resources in parallel
    const allAssetsPerResource = await Promise.all(
      resources.map((resource) =>
        ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resource._id),
          )
          .collect()
      )
    );

    // Batch: resolve thumbnail version + URL in parallel
    const thumbnails = await Promise.all(
      resources.map(async (resource, i) => {
        const assets = allAssetsPerResource[i];
        const versioned = assets
          .filter((a) => a.currentVersionId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
        const thumbAsset =
          (resource.type === "card_game"
            ? versioned.find((a) => a.assetType === "card_bg")
            : undefined) ?? versioned[0];

        if (!thumbAsset?.currentVersionId) return { url: null, count: assets.length };
        const version = await ctx.db.get(thumbAsset.currentVersionId);
        const url = version ? await ctx.storage.getUrl(version.storageId) : null;
        return { url, count: assets.length };
      })
    );

    return resources.map((resource, i) => ({
      ...resource,
      thumbnailUrl: thumbnails[i].url,
      assetCount: thumbnails[i].count,
    }));
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
    styleId: v.optional(v.id("styles")),
    type: v.union(
      v.literal("emotion_cards"),
      v.literal("board_game"),
      v.literal("card_game"),
      v.literal("free_prompt"),
      v.literal("worksheet"),
      v.literal("poster"),
      v.literal("flashcards"),
      v.literal("book")
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
    styleId: v.optional(v.id("styles")),
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
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_style", (q) => q.eq("styleId", args.styleId))
      .collect();

    if (resources.length === 0) return null;

    // Batch: fetch all assets for all resources in parallel (single pass)
    const allAssetsPerResource = await Promise.all(
      resources.map((resource) =>
        ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resource._id),
          )
          .collect()
      )
    );

    // Flatten and search in-memory: prefer "Happy", then any versioned asset
    let happyAsset: (typeof allAssetsPerResource)[0][0] | null = null;
    let fallbackAsset: (typeof allAssetsPerResource)[0][0] | null = null;

    for (const assets of allAssetsPerResource) {
      for (const asset of assets) {
        if (!asset.currentVersionId) continue;
        if (!fallbackAsset) fallbackAsset = asset;
        if (asset.assetKey.toLowerCase() === "emotion:happy") {
          happyAsset = asset;
          break;
        }
      }
      if (happyAsset) break;
    }

    const chosen = happyAsset ?? fallbackAsset;
    if (!chosen?.currentVersionId) return null;

    const version = await ctx.db.get(chosen.currentVersionId);
    if (!version) return null;
    const url = await ctx.storage.getUrl(version.storageId);
    if (!url) return null;

    return {
      url,
      emotion: chosen.assetKey.startsWith("emotion:")
        ? chosen.assetKey.replace("emotion:", "")
        : chosen.assetKey,
    };
  },
});
