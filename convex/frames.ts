import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Note: The generateFrame action is in frameActions.ts (Node.js runtime with Sharp)
// Import it from api.frameActions.generateFrame

// Frame dimension specifications (in pixels)
// These are the target dimensions for each frame type
export const FRAME_DIMENSIONS = {
  border: { width: 768, height: 1024 }, // 3:4 portrait ratio
  fullCard: { width: 768, height: 1024 }, // 3:4 portrait ratio (same as border)
} as const;

// Mutation to update a style's frame
export const updateStyleFrame = mutation({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(v.literal("border"), v.literal("fullCard")),
    storageId: v.id("_storage"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }
    if (style.isPreset) {
      throw new Error("Cannot modify frames on a preset style");
    }

    // Build the updated frames object
    const currentFrames = style.frames || {};
    const updatedFrames = {
      ...currentFrames,
      [args.frameType]: {
        storageId: args.storageId,
        prompt: args.prompt,
        generatedAt: Date.now(),
      },
    };

    await ctx.db.patch(args.styleId, {
      frames: updatedFrames,
      updatedAt: Date.now(),
    });
  },
});

// Delete a frame from a style
export const deleteFrame = mutation({
  args: {
    styleId: v.id("styles"),
    frameType: v.union(v.literal("border"), v.literal("fullCard")),
  },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);
    if (!style) {
      throw new Error("Style not found");
    }
    if (style.isPreset) {
      throw new Error("Cannot modify frames on a preset style");
    }

    if (!style.frames) {
      return; // No frames to delete
    }

    // Get the storage ID before deleting
    const frame = style.frames[args.frameType];
    if (frame?.storageId) {
      // Delete the file from storage
      await ctx.storage.delete(frame.storageId);
    }

    // Build the updated frames object without the deleted frame
    const { [args.frameType]: _, ...remainingFrames } = style.frames;

    // If no frames remain, set to undefined
    const updatedFrames =
      Object.keys(remainingFrames).length > 0 ? remainingFrames : undefined;

    await ctx.db.patch(args.styleId, {
      frames: updatedFrames,
      updatedAt: Date.now(),
    });
  },
});
