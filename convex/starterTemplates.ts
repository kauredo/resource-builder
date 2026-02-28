import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { TEMPLATE_DATA } from "./starterTemplateData";
import { FREE_LIMITS, getMonthStart } from "./users";

export const createResourceFromTemplate = mutation({
  args: {
    userId: v.id("users"),
    templateId: v.string(),
    styleId: v.optional(v.id("styles")),
  },
  handler: async (ctx, args) => {
    const template = TEMPLATE_DATA[args.templateId];
    if (!template) {
      throw new Error(`Template not found: ${args.templateId}`);
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();

    // Enforce free tier template limit
    if (user.subscription !== "pro") {
      const monthStart = getMonthStart(now);
      let templatesThisMonth = user.templatesCreatedThisMonth ?? 0;
      if (!user.monthResetAt || user.monthResetAt < monthStart) {
        templatesThisMonth = 0;
      }
      if (templatesThisMonth >= FREE_LIMITS.templatesPerMonth) {
        throw new Error(
          `LIMIT_REACHED:template:You've reached your monthly limit of ${FREE_LIMITS.templatesPerMonth} starter templates. Upgrade to Pro for unlimited access.`
        );
      }
      await ctx.db.patch(user._id, {
        templatesCreatedThisMonth: templatesThisMonth + 1,
        monthResetAt: monthStart,
      });
    }

    return await ctx.db.insert("resources", {
      userId: args.userId,
      styleId: args.styleId,
      type: template.type,
      name: template.name,
      description: template.description,
      tags: template.tags,
      content: JSON.parse(JSON.stringify(template.content)), // deep copy
      images: [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});
