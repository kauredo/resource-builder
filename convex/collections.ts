import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getUserCollections = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getUserCollectionsWithThumbnails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Collect all unique resource IDs needed (max 4 per collection for thumbnails)
    const allResourceIds: Id<"resources">[] = [];
    const seen = new Set<string>();
    for (const collection of collections) {
      for (const resourceId of collection.resourceIds.slice(0, 4)) {
        if (!seen.has(resourceId)) {
          seen.add(resourceId);
          allResourceIds.push(resourceId);
        }
      }
    }

    // Batch fetch resources + their first asset thumbnail in parallel
    const resourceWithUrls = await Promise.all(
      allResourceIds.map(async (resourceId) => {
        const resource = await ctx.db.get(resourceId);
        if (!resource) return { resourceId, url: null };

        // Find the first versioned asset for this resource
        const assets = await ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resourceId),
          )
          .collect();

        const versioned = assets
          .filter((a) => a.currentVersionId)
          .sort((a, b) => b.updatedAt - a.updatedAt);

        const thumbAsset =
          (resource.type === "card_game"
            ? versioned.find((a) => a.assetType === "card_bg")
            : undefined) ?? versioned[0];

        if (!thumbAsset?.currentVersionId) return { resourceId, url: null };
        const version = await ctx.db.get(thumbAsset.currentVersionId);
        const url = version ? await ctx.storage.getUrl(version.storageId) : null;
        return { resourceId, url };
      }),
    );
    const urlMap = new Map(
      resourceWithUrls.map(({ resourceId, url }) => [resourceId as string, url]),
    );

    return collections.map((collection) => {
      // Filter out stale resource IDs (deleted resources)
      const validIds = collection.resourceIds.filter(
        (id) => urlMap.has(id) || allResourceIds.includes(id),
      );
      return {
        ...collection,
        resourceCount: validIds.length,
        thumbnails: collection.resourceIds.slice(0, 4).map((resourceId) => ({
          id: resourceId,
          url: urlMap.get(resourceId) ?? null,
        })),
      };
    });
  },
});

export const getCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.collectionId);
  },
});

export const getCollectionWithResources = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) return null;

    // Batch fetch all resources
    const resourceResults = await Promise.all(
      collection.resourceIds.map((id) => ctx.db.get(id)),
    );

    // Filter out deleted resources
    const validResources = resourceResults.filter(
      (r): r is NonNullable<typeof r> => r !== null,
    );

    // Batch fetch assets for all resources
    const allAssetsPerResource = await Promise.all(
      validResources.map((resource) =>
        ctx.db
          .query("assets")
          .withIndex("by_owner", (q) =>
            q.eq("ownerType", "resource").eq("ownerId", resource._id),
          )
          .collect(),
      ),
    );

    // Batch resolve thumbnails
    const thumbnails = await Promise.all(
      validResources.map(async (resource, i) => {
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
      }),
    );

    return {
      ...collection,
      resources: validResources.map((resource, i) => ({
        ...resource,
        thumbnailUrl: thumbnails[i].url,
        assetCount: thumbnails[i].count,
      })),
    };
  },
});

export const getCollectionsForResource = query({
  args: { userId: v.id("users"), resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return collections
      .filter((c) => c.resourceIds.includes(args.resourceId))
      .map((c) => ({ _id: c._id, name: c.name }));
  },
});

export const createCollection = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    resourceIds: v.optional(v.array(v.id("resources"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("collections", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      resourceIds: args.resourceIds ?? [],
      createdAt: now,
    });
  },
});

export const updateCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { collectionId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );
    await ctx.db.patch(collectionId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteCollection = mutation({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.collectionId);
  },
});

export const addResourcesToCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    resourceIds: v.array(v.id("resources")),
  },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");

    const existing = new Set(collection.resourceIds.map(String));
    const toAdd = args.resourceIds.filter((id) => !existing.has(id));
    if (toAdd.length === 0) return;

    await ctx.db.patch(args.collectionId, {
      resourceIds: [...collection.resourceIds, ...toAdd],
      updatedAt: Date.now(),
    });
  },
});

export const removeResourceFromCollection = mutation({
  args: {
    collectionId: v.id("collections"),
    resourceId: v.id("resources"),
  },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (!collection) throw new Error("Collection not found");

    await ctx.db.patch(args.collectionId, {
      resourceIds: collection.resourceIds.filter((id) => id !== args.resourceId),
      updatedAt: Date.now(),
    });
  },
});
