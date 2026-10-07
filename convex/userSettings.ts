import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const getUseOpenRouter = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const user = await ctx.db.get(userId);
		return user?.useOpenRouter ?? null;
	},
});

export const setUseOpenRouter = mutation({
	args: { value: v.boolean() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		await ctx.db.patch(userId, { useOpenRouter: args.value });
	},
});
