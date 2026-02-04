import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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

    // Create new user with 14-day trial
    const trialDays = 14;
    const trialEndsAt = Date.now() + trialDays * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      subscription: "trial",
      trialEndsAt,
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

    // Create new user with 14-day trial
    const trialDays = 14;
    const trialEndsAt = Date.now() + trialDays * 24 * 60 * 60 * 1000;

    return await ctx.db.insert("users", {
      email,
      name: args.name,
      subscription: "trial",
      trialEndsAt,
      createdAt: Date.now(),
    });
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscription: v.union(
      v.literal("trial"),
      v.literal("active"),
      v.literal("expired")
    ),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
  },
});
