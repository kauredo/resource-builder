import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    name: v.string(),
    subscription: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("expired")
    ),
    trialEndsAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  styles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isPreset: v.boolean(),
    colors: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
      text: v.string(),
    }),
    typography: v.object({
      headingFont: v.string(),
      bodyFont: v.string(),
    }),
    illustrationStyle: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  characters: defineTable({
    userId: v.id("users"),
    styleId: v.id("styles"),
    name: v.string(),
    description: v.string(),
    personality: v.string(),
    referenceImages: v.array(v.id("_storage")),
    promptFragment: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_style", ["styleId"]),

  resources: defineTable({
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
    content: v.any(), // Type-specific content (EmotionCardContent, etc.)
    images: v.array(
      v.object({
        storageId: v.id("_storage"),
        description: v.string(),
        prompt: v.string(),
      })
    ),
    pdfStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("draft"), v.literal("complete")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_style", ["styleId"])
    .index("by_type", ["type"]),
});
