import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./functions";
import { getAuthUserIdOrThrow } from "./model/users";

// Groups a user's saved messages by their source chat so /saved-messages can
// render one block per chat. Saves whose chat no longer exists are removed.
export const getSavedChatSummaries = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessages = await ctx.db
			.query("savedMessages")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const summaries = new Map<
			string,
			{ chatId: string; title: string; count: number; lastSavedAt: number }
		>();

		for (const savedMessage of savedMessages) {
			const chat = await ctx.db
				.query("chats")
				.withIndex("by_chat_uuid", (q) => q.eq("uuid", savedMessage.chatId))
				.first();

			// The source chat was deleted; retained saves are kept and shown
			// under their stored title, while un-retained ones await the
			// chat-deletion cleanup and are skipped here.
			if (!chat) {
				if (!savedMessage.retained) {
					continue;
				}
				const existing = summaries.get(savedMessage.chatId);
				summaries.set(savedMessage.chatId, {
					chatId: savedMessage.chatId,
					title: savedMessage.chatTitle,
					count: (existing?.count ?? 0) + 1,
					lastSavedAt: Math.max(
						existing?.lastSavedAt ?? 0,
						savedMessage.savedAt,
					),
				});
				continue;
			}

			const existing = summaries.get(savedMessage.chatId);
			summaries.set(savedMessage.chatId, {
				chatId: savedMessage.chatId,
				title: chat.title,
				count: (existing?.count ?? 0) + 1,
				lastSavedAt: Math.max(existing?.lastSavedAt ?? 0, savedMessage.savedAt),
			});
		}

		return [...summaries.values()].sort(
			(a, b) => b.lastSavedAt - a.lastSavedAt,
		);
	},
});

// Returns saved messages of one chat ordered by the creation time of the
// original chat messages, so user + assistant saves replay in chat order.
export const getSavedMessagesByChat = query({
	args: { chatId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessages = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_chat", (q) =>
				q.eq("userId", userId).eq("chatId", args.chatId),
			)
			.collect();

		return savedMessages
			.sort((a, b) => a.orderKey - b.orderKey)
			.map((savedMessage) => {
				const { userId: _userId, ...rest } = savedMessage;
				void _userId;
				return rest;
			});
	},
});

// Saves a copy of a chat message. Idempotent per message: re-saving
// returns the existing saved doc instead of duplicating it.
export const saveMessage = mutation({
	args: {
		chatId: v.string(),
		messageId: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chat = await ctx.db
			.query("chats")
			.withIndex("by_chat_uuid", (q) => q.eq("uuid", args.chatId))
			.first();

		if (!chat || chat.userId !== userId) {
			throw new Error("Unauthorized request");
		}

		const chatMessage = await ctx.db
			.query("messages")
			.withIndex("by_source_id", (q) => q.eq("sourceMessageId", args.messageId))
			.first();

		if (!chatMessage || chatMessage.userId !== userId) {
			throw new Error("Invalid message");
		}

		const existingSaved = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_message", (q) =>
				q.eq("userId", userId).eq("messageId", args.messageId),
			)
			.first();

		if (existingSaved) {
			return existingSaved._id;
		}

		return ctx.db.insert("savedMessages", {
			userId,
			chatId: args.chatId,
			chatTitle: chat.title,
			messageId: args.messageId,
			role: chatMessage.role,
			parts: chatMessage.parts,
			metadata: chatMessage.metadata,
			// Creation time of the original chat message; keeps user + assistant
			// saves interleaved in the order they appear in the chat.
			orderKey: chatMessage._creationTime,
			savedAt: Date.now(),
		});
	},
});

// Lightweight count used by the delete-chat warning.
export const getSavedMessageCount = query({
	args: { chatId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessages = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_chat", (q) =>
				q.eq("userId", userId).eq("chatId", args.chatId),
			)
			.collect();

		return savedMessages.length;
	},
});

export const isMessageSaved = query({
	args: { messageId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessage = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_message", (q) =>
				q.eq("userId", userId).eq("messageId", args.messageId),
			)
			.first();

		return savedMessage !== null;
	},
});

export const unsaveMessage = mutation({
	args: { messageId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessage = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_message", (q) =>
				q.eq("userId", userId).eq("messageId", args.messageId),
			)
			.first();

		if (!savedMessage) {
			throw new Error("Saved message not found");
		}

		await ctx.db.delete(savedMessage._id);
	},
});

export const unsaveAllByChat = mutation({
	args: { chatId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessages = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_chat", (q) =>
				q.eq("userId", userId).eq("chatId", args.chatId),
			)
			.collect();

		for (const savedMessage of savedMessages) {
			await ctx.db.delete(savedMessage._id);
		}
	},
});

// Marks all saved messages of a chat as retained so they survive the
// chat's deletion cascade.
export const retainSavedByChat = mutation({
	args: { chatId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const savedMessages = await ctx.db
			.query("savedMessages")
			.withIndex("by_user_and_chat", (q) =>
				q.eq("userId", userId).eq("chatId", args.chatId),
			)
			.collect();

		for (const savedMessage of savedMessages) {
			await ctx.db.patch(savedMessage._id, { retained: true });
		}
	},
});

// Internal batched cleanup used by the chat-deletion trigger in functions.ts.
// Retained saves are skipped so they survive chat deletion.
export const deleteSavedByChatInternal = internalMutation({
	args: {
		chatId: v.string(),
		cursor: v.union(v.string(), v.null()),
	},
	handler: async (ctx, args) => {
		const BATCH_SIZE = 500;
		const {
			page: savedMessages,
			isDone,
			continueCursor,
		} = await ctx.db
			.query("savedMessages")
			.withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
			.paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null });

		await Promise.all(
			savedMessages
				.filter((doc) => !doc.retained)
				.map((doc) => ctx.db.delete(doc._id)),
		);

		if (!isDone) {
			await ctx.scheduler.runAfter(
				0,
				internal.savedMessages.deleteSavedByChatInternal,
				{
					chatId: args.chatId,
					cursor: continueCursor,
				},
			);
		}
	},
});
