import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
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
