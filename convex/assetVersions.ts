import { v } from "convex/values";
import { mutation } from "./_generated/server";

const MAX_UNPINNED_VERSIONS = 10;

async function getOrCreateAsset(ctx: any, args: {
  ownerType: "resource" | "style";
  ownerId: string;
  assetType: string;
  assetKey: string;
}) {
  const existing = await ctx.db
    .query("assets")
    .withIndex("by_owner_type_key", (q: any) =>
      q
        .eq("ownerType", args.ownerType)
        .eq("ownerId", args.ownerId)
        .eq("assetType", args.assetType)
        .eq("assetKey", args.assetKey)
    )
    .first();

  if (existing) return existing;

  const now = Date.now();
  const assetId = await ctx.db.insert("assets", {
    ownerType: args.ownerType,
    ownerId: args.ownerId,
    assetType: args.assetType,
    assetKey: args.assetKey,
    currentVersionId: undefined,
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(assetId);
}

async function pruneOldVersions(ctx: any, assetId: string) {
  const versions = await ctx.db
    .query("assetVersions")
    .withIndex("by_asset", (q: any) => q.eq("assetId", assetId))
    .collect();

  const unpinned = versions
    .filter((v: any) => !v.pinned)
    .sort((a: any, b: any) => b.createdAt - a.createdAt);

  if (unpinned.length <= MAX_UNPINNED_VERSIONS) return;

  const toDelete = unpinned.slice(MAX_UNPINNED_VERSIONS);
  for (const version of toDelete) {
    await ctx.storage.delete(version.storageId);
    await ctx.db.delete(version._id);
  }
}

async function createVersion(
  ctx: any,
  args: {
    ownerType: "resource" | "style";
    ownerId: string;
    assetType: string;
    assetKey: string;
    storageId: string;
    prompt: string;
    params: any;
    source: "generated" | "edited" | "uploaded";
    sourceVersionId?: string;
  },
) {
  const asset = await getOrCreateAsset(ctx, {
    ownerType: args.ownerType,
    ownerId: args.ownerId,
    assetType: args.assetType,
    assetKey: args.assetKey,
  });

  if (!asset) throw new Error("Failed to create asset");

  const now = Date.now();
  const versionId = await ctx.db.insert("assetVersions", {
    assetId: asset._id,
    storageId: args.storageId,
    prompt: args.prompt,
    params: args.params,
    source: args.source,
    sourceVersionId: args.sourceVersionId,
    createdAt: now,
    pinned: false,
  });

  await ctx.db.patch(asset._id, {
    currentVersionId: versionId,
    updatedAt: now,
  });

  await pruneOldVersions(ctx, asset._id);

  return { assetId: asset._id, versionId };
}

export const createFromGeneration = mutation({
  args: {
    ownerType: v.union(v.literal("resource"), v.literal("style")),
    ownerId: v.union(v.id("resources"), v.id("styles")),
    assetType: v.string(),
    assetKey: v.string(),
    storageId: v.id("_storage"),
    prompt: v.string(),
    params: v.any(),
    source: v.optional(
      v.union(
        v.literal("generated"),
        v.literal("edited"),
        v.literal("uploaded"),
      ),
    ),
    sourceVersionId: v.optional(v.id("assetVersions")),
  },
  handler: async (ctx, args) => {
    return await createVersion(ctx, {
      ownerType: args.ownerType,
      ownerId: args.ownerId,
      assetType: args.assetType,
      assetKey: args.assetKey,
      storageId: args.storageId,
      prompt: args.prompt,
      params: args.params,
      source: args.source ?? "generated",
      sourceVersionId: args.sourceVersionId,
    });
  },
});

export const createFromEdit = mutation({
  args: {
    ownerType: v.union(v.literal("resource"), v.literal("style")),
    ownerId: v.union(v.id("resources"), v.id("styles")),
    assetType: v.string(),
    assetKey: v.string(),
    storageId: v.id("_storage"),
    prompt: v.string(),
    params: v.any(),
    sourceVersionId: v.optional(v.id("assetVersions")),
  },
  handler: async (ctx, args) => {
    return await createVersion(ctx, {
      ownerType: args.ownerType,
      ownerId: args.ownerId,
      assetType: args.assetType,
      assetKey: args.assetKey,
      storageId: args.storageId,
      prompt: args.prompt,
      params: args.params,
      source: "edited",
      sourceVersionId: args.sourceVersionId,
    });
  },
});
