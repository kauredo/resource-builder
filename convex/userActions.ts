"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import {
  getAuthUserId,
  retrieveAccount,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Not authenticated");
    }

    // Get the current user's email via existing query
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user?.email) {
      throw new Error("User not found");
    }

    // Verify current password
    const result = await retrieveAccount(ctx, {
      provider: "password",
      account: {
        id: user.email,
        secret: args.currentPassword,
      },
    });

    if (typeof result === "string") {
      if (result === "InvalidSecret") {
        throw new Error("Current password is incorrect");
      }
      if (result === "TooManyFailedAttempts") {
        throw new Error("Too many failed attempts. Please try again later.");
      }
      throw new Error("Account not found");
    }

    // Update to new password
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: {
        id: user.email,
        secret: args.newPassword,
      },
    });

    return { success: true };
  },
});
