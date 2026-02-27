import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { TEMPLATE_DATA } from "./starterTemplateData";

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

    // NO free tier limit check — starters are free

    const now = Date.now();

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
