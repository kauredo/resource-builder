import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      reset: {
        maxAge: 60 * 60, // 1 hour
        async sendVerificationRequest({ identifier, token }) {
          const siteUrl = process.env.SITE_URL;
          const apiKey = process.env.AHASEND_API_KEY;
          const accountId = process.env.AHASEND_ACCOUNT_ID;
          const emailFrom = process.env.EMAIL_FROM;

          if (!siteUrl || !apiKey || !accountId || !emailFrom) {
            throw new Error("Missing email configuration environment variables");
          }

          const resetUrl = `${siteUrl}/reset-password?code=${encodeURIComponent(token)}&email=${encodeURIComponent(identifier)}`;

          const response = await fetch(
            `https://api.ahasend.com/v2/accounts/${accountId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: { email: emailFrom },
                recipients: [{ email: identifier }],
                subject: "Reset your password — Resource Builder",
                html_content: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                    <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Reset your password</h1>
                    <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
                      We received a request to reset the password for your Resource Builder account. Click the button below to choose a new password.
                    </p>
                    <a href="${resetUrl}" style="display: inline-block; background-color: #d4654a; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 500;">
                      Reset password
                    </a>
                    <p style="font-size: 14px; color: #888; line-height: 1.5; margin-top: 32px;">
                      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
                    </p>
                  </div>
                `,
              }),
            }
          );

          if (!response.ok) {
            const text = await response.text();
            console.error("Ahasend error:", text);
            throw new Error("Failed to send password reset email");
          }
        },
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        // User already exists, just return their ID
        return args.existingUserId;
      }

      // New user - create with required fields
      const now = Date.now();

      // Extract name from profile or derive from email
      const email = args.profile?.email as string;
      const name =
        (args.profile?.name as string) || email?.split("@")[0] || "User";

      const userId = await ctx.db.insert("users", {
        email,
        name,
        subscription: "free",
        createdAt: now,
      });

      return userId;
    },
  },
});
