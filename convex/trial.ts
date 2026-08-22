import { v } from "convex/values";
import { trialModelIds, freeModelIds } from "../src/constants/model-providers";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

export const TRIAL_MESSAGE_LIMIT = 5;
const TRIAL_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

const getUsageDoc = async (ctx: QueryCtx, userId: Id<"users">) =>
	ctx.db
		.query("trialUsage")
		.withIndex("by_user", (q) => q.eq("userId", userId))
		.order("desc")
		.first();

const getActiveUsage = (usage: Doc<"trialUsage"> | null, now: number) => {
	if (!usage?.resetAt || usage.resetAt <= now) return null;
	return usage;
};

export const getUsage = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const now = Date.now();
		const usage = getActiveUsage(await getUsageDoc(ctx, userId), now);

		return {
			used: usage?.messages ?? 0,
			limit: TRIAL_MESSAGE_LIMIT,
			remaining: Math.max(0, TRIAL_MESSAGE_LIMIT - (usage?.messages ?? 0)),
			resetAt: usage?.resetAt ?? null,
		};
	},
});

export const releaseMessage = mutation({
	args: { periodStartedAt: v.number() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const usage = await getUsageDoc(ctx, userId);

		// Do not refund a failed request into a newer 30-day period.
		if (usage?.periodStartedAt === args.periodStartedAt && usage.messages > 0) {
			await ctx.db.patch(usage._id, { messages: usage.messages - 1 });
		}
	},
});

export const reserveMessage = mutation({
	args: { modelId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		if (!(trialModelIds as readonly string[]).includes(args.modelId)) {
			throw new Error(`Model ${args.modelId} is not available in the trial`);
		}

		// Truly free models don't consume the trial message quota, so trial
		// users can use them regardless of how many paid messages remain.
		if ((freeModelIds as readonly string[]).includes(args.modelId)) {
			return { remaining: Number.POSITIVE_INFINITY, periodStartedAt: undefined };
		}

		const now = Date.now();
		const usage = await getUsageDoc(ctx, userId);
		const activeUsage = getActiveUsage(usage, now);
		const used = activeUsage?.messages ?? 0;
		if (used >= TRIAL_MESSAGE_LIMIT && activeUsage) {
			const resetAt = activeUsage.resetAt as number;
			throw new Error(
				`You've used all 5 free messages. Your trial resets on ${new Date(resetAt).toISOString().slice(0, 10)}.`,
			);
		}

		const periodStartedAt = activeUsage?.periodStartedAt ?? now;
		const resetAt = activeUsage?.resetAt ?? now + TRIAL_PERIOD_MS;
		if (usage) {
			await ctx.db.patch(usage._id, {
				month: new Date(periodStartedAt).toISOString(),
				messages: used + 1,
				periodStartedAt,
				resetAt,
			});
		} else {
			await ctx.db.insert("trialUsage", {
				userId,
				month: new Date(periodStartedAt).toISOString(),
				messages: 1,
				periodStartedAt,
				resetAt,
			});
		}

		return { remaining: TRIAL_MESSAGE_LIMIT - used - 1, periodStartedAt };
	},
});
