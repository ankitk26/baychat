import { v } from "convex/values";
import { MessageMetadata } from "~/types";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
	type QueryCtx,
	internalMutation,
	mutation,
	query,
} from "./_generated/server";
import { getAuthUserIdOrThrow } from "./model/users";

const hydrateStoredFileParts = async (ctx: QueryCtx, parts: string) => {
	let parsedParts: unknown;
	try {
		parsedParts = JSON.parse(parts);
	} catch {
		// Keep malformed legacy data readable instead of failing the whole query.
		return parts;
	}

	if (!Array.isArray(parsedParts)) {
		return parts;
	}

	const hydratedParts = await Promise.all(
		parsedParts.map(async (part) => {
			if (
				!part ||
				typeof part !== "object" ||
				part.type !== "file" ||
				typeof part.url !== "string"
			) {
				return part;
			}

			const storageId = part.providerMetadata?.convex?.storageId;
			if (typeof storageId !== "string") {
				return part;
			}

			const freshUrl = await ctx.storage.getUrl(storageId as Id<"_storage">);
			if (!freshUrl) {
				return part;
			}

			return {
				...part,
				url: freshUrl,
			};
		}),
	);

	return JSON.stringify(hydratedParts);
};

export const getMessages = query({
	args: { chatId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_user_chat", (q) =>
				q.eq("chatId", args.chatId).eq("userId", userId),
			)
			.order("asc")
			.collect();

		return Promise.all(
			messages.map(async ({ userId: _, ...rest }) => ({
				...rest,
				parts: await hydrateStoredFileParts(ctx, rest.parts),
			})),
		);
	},
});

export const getSharedChatMessages = query({
	args: {
		sharedChatUuid: v.string(),
	},
	handler: async (ctx, args) => {
		const sharedChat = await ctx.db
			.query("sharedChats")
			.withIndex("by_uuid", (q) => q.eq("uuid", args.sharedChatUuid))
			.first();

		if (!sharedChat) {
			return null;
		}

		if (!sharedChat.isActive) {
			return null;
		}

		const parentChat = await ctx.db
			.query("chats")
			.withIndex("by_chat_uuid", (q) => q.eq("uuid", sharedChat.parentChatUuid))
			.first();

		const messages = await ctx.db
			.query("messages")
			.withIndex("by_chat", (q) =>
				q
					.eq("chatId", sharedChat.parentChatUuid)
					.lte("_creationTime", sharedChat.updatedTime),
			)
			.order("asc")
			.collect();

		return {
			sharedChat,
			messages: await Promise.all(
				messages.map(async ({ userId: _, ...rest }) => ({
					...rest,
					parts: await hydrateStoredFileParts(ctx, rest.parts),
				})),
			),
			parentChatTitle: parentChat?.title,
		};
	},
});

export const createMessage = mutation({
	args: {
		messageBody: v.object({
			sourceMessageId: v.string(),
			chatId: v.string(),
			parts: v.string(),
			role: v.union(v.literal("user"), v.literal("assistant")),
			metadata: v.optional(v.string()),
		}),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		let parsedParts: unknown;
		try {
			parsedParts = JSON.parse(args.messageBody.parts);
		} catch {
			parsedParts = null;
		}

		if (Array.isArray(parsedParts)) {
			for (const part of parsedParts) {
				const storageId = part?.providerMetadata?.convex?.storageId;
				if (typeof storageId !== "string") {
					continue;
				}

				// Record attachment ownership once so URL lookups can authorize by storageId.
				const existingFile = await ctx.db
					.query("uploadedFiles")
					.withIndex("by_storage_id", (q) =>
						q.eq("storageId", storageId as Id<"_storage">),
					)
					.first();

				if (!existingFile) {
					await ctx.db.insert("uploadedFiles", {
						userId,
						storageId: storageId as Id<"_storage">,
					});
				}
			}
		}

		await ctx.db.insert("messages", {
			sourceMessageId: args.messageBody.sourceMessageId,
			chatId: args.messageBody.chatId,
			parts: args.messageBody.parts,
			role: args.messageBody.role,
			userId,
			metadata: args.messageBody.metadata,
		});

		// below logic is required to handle tokens generated while regeneration
		if (args.messageBody.role === "assistant") {
			const parsedMetadata: MessageMetadata = JSON.parse(
				args.messageBody.metadata ?? "",
			);
			const modelUsedName = parsedMetadata.modelName as string;
			const modelId = parsedMetadata.modelId as string;
			const modelIdPrefix = modelId.split("/")[0];
			const modelProvider =
				modelIdPrefix === "bytedance-seed" ? "byteDance" : modelIdPrefix;
			const totalTokens = parsedMetadata.totalTokens as number;

			// Only process if tokens is a valid number
			if (
				typeof totalTokens === "number" &&
				!Number.isNaN(totalTokens) &&
				totalTokens > 0
			) {
				const modelTokenDoc = await ctx.db
					.query("userTokenUsage")
					.withIndex("by_user_and_model", (q) =>
						q.eq("userId", userId).eq("model", modelUsedName),
					)
					.first();

				if (modelTokenDoc) {
					await ctx.db.patch(modelTokenDoc._id, {
						tokens: modelTokenDoc.tokens + totalTokens,
						provider: modelProvider,
					});
				} else {
					await ctx.db.insert("userTokenUsage", {
						userId,
						model: modelUsedName,
						provider: modelProvider,
						tokens: totalTokens,
					});
				}
			}
		}

		return args.messageBody.chatId;
	},
});

export const deleteMessagesByTimestamp = mutation({
	args: {
		currentMessageSourceId: v.string(),
		chatId: v.string(),
		deleteCurrentMessage: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const currentMessage = await ctx.db
			.query("messages")
			.withIndex("by_source_id", (q) =>
				q.eq("sourceMessageId", args.currentMessageSourceId),
			)
			.first();

		if (!currentMessage) {
			throw new Error("Invalid message");
		}

		if (currentMessage.userId !== userId) {
			throw new Error("Unauthorized access");
		}

		let messagesAfterCurrentMessage = ctx.db
			.query("messages")
			.withIndex("by_chat", (q) =>
				q
					.eq("chatId", args.chatId)
					.gt("_creationTime", currentMessage._creationTime),
			);

		// if message is a user message, don't delete current message
		if (args.deleteCurrentMessage) {
			messagesAfterCurrentMessage = ctx.db
				.query("messages")
				.withIndex("by_chat", (q) =>
					q
						.eq("chatId", args.chatId)
						.gte("_creationTime", currentMessage._creationTime),
				);
		}

		for await (const message of messagesAfterCurrentMessage) {
			await ctx.db.delete(message._id);
		}
	},
});

export const deleteMessagesByChat = internalMutation({
	args: {
		chatId: v.string(),
		cursor: v.union(v.string(), v.null()),
	},
	handler: async (ctx, args) => {
		const BATCH_SIZE = 500;
		const {
			page: messages,
			isDone,
			continueCursor,
		} = await ctx.db
			.query("messages")
			.withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
			.paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null });

		await Promise.all(messages.map((message) => ctx.db.delete(message._id)));

		if (!isDone) {
			// Schedule next batch using the continueCursor
			await ctx.scheduler.runAfter(0, internal.messages.deleteMessagesByChat, {
				chatId: args.chatId,
				cursor: continueCursor,
			});
		}
	},
});

export const tokensByModel = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const stats = await ctx.db
			.query("userTokenUsage")
			.withIndex("by_user_and_model", (q) => q.eq("userId", userId))
			.collect();

		const sortedStats = stats
			.filter(
				(stat) => typeof stat.tokens === "number" && !Number.isNaN(stat.tokens),
			)
			.sort((a, b) => b.tokens - a.tokens)
			.map(({ model, provider, tokens }) => ({ model, provider, tokens }));

		return sortedStats;
	},
});

export const generateUploadUrl = mutation({
	handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});
