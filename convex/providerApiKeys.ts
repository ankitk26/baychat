import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";
import { createMaskedHint } from "./providerApiKeyUtils";
import { apiTokens } from "./tokens";

const providerValidator = v.union(
	v.literal("gemini"),
	v.literal("openai"),
	v.literal("anthropic"),
	v.literal("openrouter"),
	v.literal("xai"),
);

const providers = [
	"gemini",
	"openai",
	"anthropic",
	"openrouter",
	"xai",
] as const;

export const save = mutation({
	args: {
		provider: providerValidator,
		value: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const value = args.value.trim();
		if (!value || value.length > 4096) {
			throw new Error("API key must contain between 1 and 4096 characters.");
		}

		await apiTokens.storeKey(ctx, {
			namespace: userId,
			keyName: args.provider,
			value,
		});

		const existingHint = await ctx.db
			.query("providerApiKeyHints")
			.withIndex("by_user_and_provider", (q) =>
				q.eq("userId", userId).eq("provider", args.provider),
			)
			.first();
		const maskedHint = createMaskedHint(args.provider, value) ?? undefined;
		if (existingHint) {
			await ctx.db.patch(existingHint._id, {
				maskedHint,
				updatedAt: Date.now(),
			});
		} else {
			await ctx.db.insert("providerApiKeyHints", {
				userId,
				provider: args.provider,
				maskedHint,
				updatedAt: Date.now(),
			});
		}
	},
});

export const remove = mutation({
	args: { provider: providerValidator },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const deleted = await apiTokens.deleteEncrypted(ctx, {
			namespace: userId,
			keyName: args.provider,
		});
		const hint = await ctx.db
			.query("providerApiKeyHints")
			.withIndex("by_user_and_provider", (q) =>
				q.eq("userId", userId).eq("provider", args.provider),
			)
			.first();
		if (hint) await ctx.db.delete(hint._id);
		return deleted;
	},
});

export const listConfigured = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const keys = await apiTokens.listEncryptedKeys(ctx, { namespace: userId });
		const configured = new Set(keys.map((key) => key.keyName));
		const configuredProviders = providers.filter((provider) =>
			configured.has(provider),
		);
		return await Promise.all(
			configuredProviders.map(async (provider) => {
				const value = await apiTokens.getKey(ctx, {
					namespace: userId,
					keyName: provider,
				});
				return {
					provider,
					maskedHint: value ? createMaskedHint(provider, value) : null,
				};
			}),
		);
	},
});

export const getForServer = internalQuery({
	args: {
		authId: v.string(),
		provider: providerValidator,
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_auth", (q) => q.eq("authId", args.authId))
			.first();
		if (!user) return null;

		return await apiTokens.getKey(ctx, {
			namespace: user._id,
			keyName: args.provider,
		});
	},
});
