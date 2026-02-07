import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getByOwner = query({
  args: {
    ownerType: v.union(v.literal("resource"), v.literal("style")),
    ownerId: v.union(v.id("resources"), v.id("styles")),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_owner", (q) =>
        q.eq("ownerType", args.ownerType).eq("ownerId", args.ownerId),
      )
      .collect();

    return await Promise.all(
      assets.map(async (asset) => {
        const current = asset.currentVersionId
          ? await ctx.db.get(asset.currentVersionId)
          : null;
        const url = current
          ? await ctx.storage.getUrl(current.storageId)
          : null;
        return {
          ...asset,
          currentVersion: current
            ? {
                ...current,
                url,
              }
            : null,
        };
      }),
    );
  },
});

export const getAsset = query({
  args: {
    ownerType: v.union(v.literal("resource"), v.literal("style")),
    ownerId: v.union(v.id("resources"), v.id("styles")),
    assetType: v.string(),
    assetKey: v.string(),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db
      .query("assets")
      .withIndex("by_owner_type_key", (q) =>
        q
          .eq("ownerType", args.ownerType)
          .eq("ownerId", args.ownerId)
          .eq("assetType", args.assetType)
          .eq("assetKey", args.assetKey),
      )
      .first();

    if (!asset) return null;

    const versions = await ctx.db
      .query("assetVersions")
      .withIndex("by_asset", (q) => q.eq("assetId", asset._id))
      .collect();

    const versionsWithUrls = await Promise.all(
      versions
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(async (version) => ({
          ...version,
          url: await ctx.storage.getUrl(version.storageId),
        })),
    );

    const current = asset.currentVersionId
      ? versionsWithUrls.find((v) => v._id === asset.currentVersionId) ?? null
      : null;

    return {
      ...asset,
      currentVersion: current,
      versions: versionsWithUrls,
    };
  },
});

export const setCurrentVersion = mutation({
  args: {
    assetId: v.id("assets"),
    versionId: v.id("assetVersions"),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) throw new Error("Asset not found");

    const version = await ctx.db.get(args.versionId);
    if (!version || version.assetId !== asset._id) {
      throw new Error("Version does not belong to asset");
    }

    await ctx.db.patch(args.assetId, {
      currentVersionId: args.versionId,
      updatedAt: Date.now(),
    });

    if (
      asset.ownerType === "style" &&
      (asset.assetType === "frame_border" || asset.assetType === "frame_full_card")
    ) {
      const style = await ctx.db.get(asset.ownerId as Id<"styles">);
      if (style) {
        const frameType = asset.assetType === "frame_border" ? "border" : "fullCard";
        const currentFrames = style.frames ?? {};
        await ctx.db.patch(asset.ownerId as Id<"styles">, {
          frames: {
            ...currentFrames,
            [frameType]: {
              storageId: version.storageId,
              prompt: version.prompt,
              generatedAt: Date.now(),
            },
          },
          updatedAt: Date.now(),
        });
      }
    }
  },
});

export const pinVersion = mutation({
  args: {
    versionId: v.id("assetVersions"),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.versionId, { pinned: args.pinned });
  },
});

export const deleteVersion = mutation({
  args: {
    versionId: v.id("assetVersions"),
  },
  handler: async (ctx, args) => {
    const version = await ctx.db.get(args.versionId);
    if (!version) return;

    const asset = await ctx.db.get(version.assetId);
    if (!asset) return;

    await ctx.storage.delete(version.storageId);
    await ctx.db.delete(args.versionId);

    const remaining = await ctx.db
      .query("assetVersions")
      .withIndex("by_asset", (q) => q.eq("assetId", asset._id))
      .collect();

    const nextCurrent = remaining.sort((a, b) => b.createdAt - a.createdAt)[0];

    await ctx.db.patch(asset._id, {
      currentVersionId: nextCurrent?._id,
      updatedAt: Date.now(),
    });

    if (
      asset.ownerType === "style" &&
      (asset.assetType === "frame_border" || asset.assetType === "frame_full_card")
    ) {
      const style = await ctx.db.get(asset.ownerId as Id<"styles">);
      if (style) {
        const frameType = asset.assetType === "frame_border" ? "border" : "fullCard";
        const currentFrames = style.frames ?? {};
        const nextFrame = nextCurrent
          ? {
              storageId: nextCurrent.storageId,
              prompt: nextCurrent.prompt,
              generatedAt: Date.now(),
            }
          : undefined;
        const updatedFrames = nextFrame
          ? { ...currentFrames, [frameType]: nextFrame }
          : (() => {
              const { [frameType]: _, ...rest } = currentFrames;
              return Object.keys(rest).length > 0 ? rest : undefined;
            })();

        await ctx.db.patch(asset.ownerId as Id<"styles">, {
          frames: updatedFrames,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
