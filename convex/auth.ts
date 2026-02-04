import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

const TRIAL_DURATION_DAYS = 14;

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // User already exists, just return their ID
        return args.existingUserId;
      }

      // New user - create with required fields
      const now = Date.now();
      const trialEndsAt = now + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

      // Extract name from profile or email
      const email = args.profile?.email as string;
      const name = (args.profile?.name as string) || email?.split("@")[0] || "User";

      const userId = await ctx.db.insert("users", {
        email,
        name,
        subscription: "trial",
        trialEndsAt,
        createdAt: now,
      });

      return userId;
    },
  },
});
