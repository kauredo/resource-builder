import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Free tier limits
export const FREE_LIMITS = { styles: 1, characters: 1, resourcesPerMonth: 2, templatesPerMonth: 3 };

// Get the start of the current calendar month (UTC)
export function getMonthStart(now: number): number {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

// Helper: resolve authenticated user from context
async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) return null;
  const authUser = await ctx.db.get(authUserId);
  if (!authUser) return null;
  const email = authUser.email as string | undefined;
  if (!email) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
  return user;
}

// Helper: resolve authenticated user, throw if not found
async function requireAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const user = await getAuthenticatedUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

// Get user by email (for internal use)
export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get the currently authenticated user
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;

    // Get the auth user to access email
    const authUser = await ctx.db.get(authUserId);
    if (!authUser) return null;

    // Find our custom user by email
    const email = authUser.email as string | undefined;
    if (!email) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

// Check if user is authenticated
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    return authUserId !== null;
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      subscription: "free",
      createdAt: Date.now(),
    });
  },
});

// Ensure user exists after authentication - creates if needed
export const ensureUser = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get the auth user to access email
    const authUser = await ctx.db.get(authUserId);
    if (!authUser) {
      throw new Error("Auth user not found");
    }

    const email = authUser.email as string | undefined;
    if (!email) {
      throw new Error("No email found");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      email,
      name: args.name,
      subscription: "free",
      createdAt: Date.now(),
    });
  },
});

// Update the current user's name
export const updateUserName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get the auth user to access email
    const authUser = await ctx.db.get(authUserId);
    if (!authUser) {
      throw new Error("Auth user not found");
    }

    const email = authUser.email as string | undefined;
    if (!email) {
      throw new Error("No email found");
    }

    // Find the user and update their name
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { name: args.name });
    return user._id;
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscription: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const { userId, subscription } = args;
    await ctx.db.patch(userId, { subscription });
  },
});

// Admin helpers
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const caller = await getAuthenticatedUser(ctx);
  if (!caller || !getAdminEmails().includes(caller.email.toLowerCase())) {
    throw new Error("Not authorized");
  }
  return caller;
}

export const adminGetStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();
    const adminEmails = getAdminEmails();
    const realUsers = allUsers.filter(
      (u) => !adminEmails.includes(u.email.toLowerCase()),
    );
    const realUserIds = new Set(realUsers.map((u) => u._id));

    const allResources = await ctx.db.query("resources").collect();
    const allStyles = await ctx.db.query("styles").collect();
    const allCharacters = await ctx.db.query("characters").collect();

    const userResources = allResources.filter((r) => realUserIds.has(r.userId));
    const userStyles = allStyles.filter((s) => !s.isPreset && s.userId && realUserIds.has(s.userId));
    const userCharacters = allCharacters.filter((c) => realUserIds.has(c.userId));

    const byType: Record<string, number> = {};
    let complete = 0;
    let draft = 0;
    for (const r of userResources) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
      if (r.status === "complete") complete++;
      else draft++;
    }

    return {
      users: {
        total: realUsers.length,
        pro: realUsers.filter((u) => u.subscription === "pro").length,
        free: realUsers.filter((u) => u.subscription === "free").length,
      },
      resources: {
        total: userResources.length,
        complete,
        draft,
        byType,
      },
      styles: {
        total: userStyles.length,
        custom: userStyles.length,
      },
      characters: { total: userCharacters.length },
    };
  },
});

export const adminListUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("users").collect();
    const adminEmails = getAdminEmails();

    return await Promise.all(
      allUsers.map(async (user) => {
        const resources = await ctx.db
          .query("resources")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        const styles = await ctx.db
          .query("styles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        const characters = await ctx.db
          .query("characters")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const resourcesComplete = resources.filter(
          (r) => r.status === "complete",
        ).length;
        const customStyles = styles.length;

        // Most recent resource activity
        let lastActivity: number | null = null;
        for (const r of resources) {
          const ts = r.updatedAt ?? r.createdAt;
          if (!lastActivity || ts > lastActivity) lastActivity = ts;
        }

        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          subscription: user.subscription,
          dodoCustomerId: user.dodoCustomerId ?? null,
          createdAt: user.createdAt,
          onboardingCompleted: user.onboardingCompleted ?? false,
          resourcesCreatedThisMonth: user.resourcesCreatedThisMonth ?? 0,
          isAdmin: adminEmails.includes(user.email.toLowerCase()),
          counts: {
            resources: resources.length,
            resourcesComplete,
            styles: customStyles,
            characters: characters.length,
          },
          lastActivity,
        };
      }),
    );
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return false;
    return getAdminEmails().includes(user.email.toLowerCase());
  },
});

export const adminLookupUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    if (!caller || !getAdminEmails().includes(caller.email.toLowerCase())) {
      throw new Error("Not authorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      subscription: user.subscription,
      dodoCustomerId: user.dodoCustomerId ?? null,
      createdAt: user.createdAt,
    };
  },
});

export const adminSetSubscription = mutation({
  args: {
    email: v.string(),
    subscription: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    const caller = await getAuthenticatedUser(ctx);
    if (!caller || !getAdminEmails().includes(caller.email.toLowerCase())) {
      throw new Error("Not authorized");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { subscription: args.subscription });
  },
});

// Called by the Dodo Payments webhook handler to activate/deactivate subscriptions.
// Looks up user by email to update their subscription status.
export const handleSubscriptionWebhook = mutation({
  args: {
    email: v.string(),
    dodoCustomerId: v.string(),
    dodoSubscriptionId: v.string(),
    status: v.union(v.literal("pro"), v.literal("free")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!user) {
      console.error(`Webhook: no user found for email ${args.email}`);
      return;
    }

    await ctx.db.patch(user._id, {
      subscription: args.status,
      dodoCustomerId: args.dodoCustomerId,
      dodoSubscriptionId: args.dodoSubscriptionId,
    });
  },
});

// Mark onboarding as completed
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    const authUser = await ctx.db.get(authUserId);
    if (!authUser) {
      throw new Error("Auth user not found");
    }

    const email = authUser.email as string | undefined;
    if (!email) {
      throw new Error("No email found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { onboardingCompleted: true });
    return user._id;
  },
});

// Record when user creates their first resource
export const recordFirstResource = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthenticatedUser(ctx);

    // Only update if not already set
    if (!user.firstResourceCreatedAt) {
      await ctx.db.patch(user._id, {
        firstResourceCreatedAt: Date.now(),
        onboardingCompleted: true,
      });
    }

    return user._id;
  },
});

// Get current user with resolved avatar URL
export const currentUserWithAvatar = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    let avatarUrl: string | null = null;

    // Priority: character avatar > uploaded image
    if (user.avatarCharacterId) {
      const character = await ctx.db.get(user.avatarCharacterId);
      if (character) {
        const imageId = character.primaryImageId ?? character.referenceImages[0];
        if (imageId) {
          avatarUrl = await ctx.storage.getUrl(imageId);
        }
      }
    } else if (user.avatarImageStorageId) {
      avatarUrl = await ctx.storage.getUrl(user.avatarImageStorageId);
    }

    return { ...user, avatarUrl };
  },
});

// Set avatar to a character
export const updateUserAvatar = mutation({
  args: {
    characterId: v.optional(v.id("characters")),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthenticatedUser(ctx);

    if (args.characterId) {
      // Verify character belongs to this user
      const character = await ctx.db.get(args.characterId);
      if (!character || character.userId !== user._id) {
        throw new Error("Character not found");
      }
      await ctx.db.patch(user._id, {
        avatarCharacterId: args.characterId,
        avatarImageStorageId: undefined,
      });
    } else if (args.imageStorageId) {
      await ctx.db.patch(user._id, {
        avatarCharacterId: undefined,
        avatarImageStorageId: args.imageStorageId,
      });
    }
  },
});

// Clear avatar
export const clearUserAvatar = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthenticatedUser(ctx);
    await ctx.db.patch(user._id, {
      avatarCharacterId: undefined,
      avatarImageStorageId: undefined,
    });
  },
});

// Generate upload URL for avatar image
export const generateAvatarUploadUrl = mutation({
  handler: async (ctx) => {
    await requireAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

// Get subscription limits and current usage for the authenticated user
export const getSubscriptionLimits = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    if (user.subscription === "pro") {
      return {
        subscription: "pro" as const,
        limits: { styles: Infinity, characters: Infinity, resourcesPerMonth: Infinity, templatesPerMonth: Infinity },
        usage: { styles: 0, characters: 0, resourcesThisMonth: 0, templatesThisMonth: 0 },
        canCreate: { style: true, character: true, resource: true, template: true },
      };
    }

    // Count custom styles (by_user only returns custom — shared presets have no userId)
    const customStyles = await ctx.db
      .query("styles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const customStyleCount = customStyles.length;

    // Count characters
    const allCharacters = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const characterCount = allCharacters.length;

    // Monthly resource count
    const now = Date.now();
    const monthStart = getMonthStart(now);
    const isNewMonth = !user.monthResetAt || user.monthResetAt < monthStart;
    const resourcesThisMonth = isNewMonth ? 0 : (user.resourcesCreatedThisMonth ?? 0);
    const templatesThisMonth = isNewMonth ? 0 : (user.templatesCreatedThisMonth ?? 0);

    return {
      subscription: "free" as const,
      limits: FREE_LIMITS,
      usage: {
        styles: customStyleCount,
        characters: characterCount,
        resourcesThisMonth,
        templatesThisMonth,
      },
      canCreate: {
        style: customStyleCount < FREE_LIMITS.styles,
        character: characterCount < FREE_LIMITS.characters,
        resource: resourcesThisMonth < FREE_LIMITS.resourcesPerMonth,
        template: templatesThisMonth < FREE_LIMITS.templatesPerMonth,
      },
    };
  },
});

// Delete account and all associated data
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuthenticatedUser(ctx);
    const userId = user._id;

    // Collect all storage IDs to delete
    const storageIds: Set<string> = new Set();

    // 1. Delete resources + their images
    const resources = await ctx.db
      .query("resources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const resource of resources) {
      for (const img of resource.images) {
        storageIds.add(img.storageId);
      }
      if (resource.pdfStorageId) {
        storageIds.add(resource.pdfStorageId);
      }
      // Delete assets + versions owned by this resource
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_owner", (q) => q.eq("ownerType", "resource").eq("ownerId", resource._id))
        .collect();
      for (const asset of assets) {
        const versions = await ctx.db
          .query("assetVersions")
          .withIndex("by_asset", (q) => q.eq("assetId", asset._id))
          .collect();
        for (const version of versions) {
          storageIds.add(version.storageId);
          await ctx.db.delete(version._id);
        }
        await ctx.db.delete(asset._id);
      }
      await ctx.db.delete(resource._id);
    }

    // 2. Delete styles + their frame storage + style-owned assets
    const styles = await ctx.db
      .query("styles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const style of styles) {
      if (style.frames?.border?.storageId) storageIds.add(style.frames.border.storageId);
      if (style.frames?.fullCard?.storageId) storageIds.add(style.frames.fullCard.storageId);
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_owner", (q) => q.eq("ownerType", "style").eq("ownerId", style._id))
        .collect();
      for (const asset of assets) {
        const versions = await ctx.db
          .query("assetVersions")
          .withIndex("by_asset", (q) => q.eq("assetId", asset._id))
          .collect();
        for (const version of versions) {
          storageIds.add(version.storageId);
          await ctx.db.delete(version._id);
        }
        await ctx.db.delete(asset._id);
      }
      await ctx.db.delete(style._id);
    }

    // 3. Delete characters + their images
    const characters = await ctx.db
      .query("characters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const character of characters) {
      for (const imgId of character.referenceImages) {
        storageIds.add(imgId);
      }
      if (character.primaryImageId) storageIds.add(character.primaryImageId);
      await ctx.db.delete(character._id);
    }

    // 4. Delete character groups
    const groups = await ctx.db
      .query("characterGroups")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const group of groups) {
      await ctx.db.delete(group._id);
    }

    // 5. Delete avatar uploaded image
    if (user.avatarImageStorageId) {
      storageIds.add(user.avatarImageStorageId);
    }

    // 6. Delete all storage files
    for (const storageId of storageIds) {
      try {
        await ctx.storage.delete(storageId as any);
      } catch {
        // Storage file may already be deleted
      }
    }

    // 7. Delete user document
    await ctx.db.delete(userId);
  },
});
