import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    name: v.string(),
    subscription: v.union(v.literal("free"), v.literal("pro")),
    dodoCustomerId: v.optional(v.string()),
    dodoSubscriptionId: v.optional(v.string()),
    // Monthly resource creation tracking (stored counter for O(1) checks)
    resourcesCreatedThisMonth: v.optional(v.number()),
    monthResetAt: v.optional(v.number()),
    createdAt: v.number(),
    // Onboarding tracking
    onboardingCompleted: v.optional(v.boolean()),
    firstResourceCreatedAt: v.optional(v.number()),
    // Avatar: character-based or uploaded image
    avatarCharacterId: v.optional(v.id("characters")),
    avatarImageStorageId: v.optional(v.id("_storage")),
  }).index("by_email", ["email"]),

  styles: defineTable({
    userId: v.optional(v.id("users")),
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
    // Card text positioning settings
    cardLayout: v.optional(
      v.object({
        // Where text sits: bottom (separate area), overlay (over image), integrated (no separate area)
        textPosition: v.optional(
          v.union(
            v.literal("bottom"),
            v.literal("overlay"),
            v.literal("integrated"),
          ),
        ),
        // Height of content area as percentage (10-40), default 25
        contentHeight: v.optional(v.number()),
        // How much content overlaps image as percentage (0-20), default 0
        imageOverlap: v.optional(v.number()),
        // Simple CSS border (alternative to generated frame assets)
        borderWidth: v.optional(v.number()), // 0-8 pixels
        borderColor: v.optional(v.string()), // CSS color
      }),
    ),
    // Custom suffix to add to frame generation prompts
    framePromptSuffix: v.optional(v.string()),
    // Default frame usage settings (inherited by new resources)
    defaultUseFrames: v.optional(
      v.object({
        border: v.optional(v.boolean()),
        fullCard: v.optional(v.boolean()),
      }),
    ),
    // Frame assets for card decoration
    frames: v.optional(
      v.object({
        border: v.optional(
          v.object({
            storageId: v.id("_storage"),
            prompt: v.string(),
            generatedAt: v.number(),
          }),
        ),
        fullCard: v.optional(
          v.object({
            storageId: v.id("_storage"),
            prompt: v.string(),
            generatedAt: v.number(),
          }),
        ),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_preset", ["isPreset"]),

  characters: defineTable({
    userId: v.id("users"),
    primaryImageId: v.optional(v.id("_storage")),
    name: v.string(),
    description: v.string(),
    personality: v.string(),
    referenceImages: v.array(v.id("_storage")),
    // Per-image AI-generated visual descriptions, keyed by storageId
    imageDescriptions: v.optional(v.record(v.string(), v.string())),
    promptFragment: v.string(),
    promptFragmentUpdatedAt: v.optional(v.number()),
    // Styled portrait gallery: one per style, generated on demand
    styledPortraits: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          styleId: v.id("styles"),
          createdAt: v.number(),
        }),
      ),
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  resources: defineTable({
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
      v.literal("book"),
      v.literal("behavior_chart"),
      v.literal("visual_schedule"),
      v.literal("certificate"),
      v.literal("coloring_pages"),
    ),
    name: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
    content: v.any(), // Type-specific content (EmotionCardContent, etc.)
    images: v.array(
      v.object({
        storageId: v.id("_storage"),
        description: v.string(),
        prompt: v.string(),
      }),
    ),
    pdfStorageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("draft"), v.literal("complete")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_style", ["styleId"])
    .index("by_type", ["type"]),

  characterGroups: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    characterIds: v.array(v.id("characters")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  assets: defineTable({
    ownerType: v.union(v.literal("resource"), v.literal("style")),
    ownerId: v.union(v.id("resources"), v.id("styles")),
    assetType: v.string(),
    assetKey: v.string(),
    currentVersionId: v.optional(v.id("assetVersions")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerType", "ownerId"])
    .index("by_owner_type", ["ownerType", "ownerId", "assetType"])
    .index("by_owner_type_key", [
      "ownerType",
      "ownerId",
      "assetType",
      "assetKey",
    ])
    .index("by_type", ["assetType"]),

  assetVersions: defineTable({
    assetId: v.id("assets"),
    storageId: v.id("_storage"),
    prompt: v.string(),
    params: v.any(),
    source: v.union(
      v.literal("generated"),
      v.literal("edited"),
      v.literal("uploaded"),
    ),
    sourceVersionId: v.optional(v.id("assetVersions")),
    pinned: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_asset", ["assetId"])
    .index("by_asset_created", ["assetId", "createdAt"]),
});
