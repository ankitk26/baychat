import { v } from "convex/values";
import { mutation, query } from "./functions";
import { getAuthUserIdOrThrow } from "./model/users";

export const getPinnedModelIds = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const pinnedModels = await ctx.db
			.query("pinnedModels")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		return pinnedModels.map((pinnedModel) => pinnedModel.modelId);
	},
});

export const togglePinnedModel = mutation({
	args: {
		modelId: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const existing = await ctx.db
			.query("pinnedModels")
			.withIndex("by_user_and_model", (q) =>
				q.eq("userId", userId).eq("modelId", args.modelId),
			)
			.first();

		if (existing) {
			await ctx.db.delete(existing._id);
			return false;
		}

		await ctx.db.insert("pinnedModels", {
			userId,
			modelId: args.modelId,
		});
		return true;
	},
});
