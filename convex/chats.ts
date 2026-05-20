import { v } from "convex/values";
import { generateRandomUUID } from "~/lib/generate-random-uuid";
import { internal } from "./_generated/api";
import { query } from "./_generated/server";
import { internalMutation, mutation } from "./functions";
import { selectChatFields } from "./model/chats";
import { getAuthUserIdOrThrow } from "./model/users";

export const getChats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_user_and_archived", (q) =>
				q.eq("userId", userId).eq("isArchived", false),
			)
			.order("desc")
			.collect();

		const selectedFieldsChats = chats.map((chat) => selectChatFields(chat));

		return selectedFieldsChats;
	},
});

export const getUnpinnedChats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_user_and_pinned_and_folder_and_archived", (q) =>
				q
					.eq("userId", userId)
					.eq("isPinned", false)
					.eq("folderId", undefined)
					.eq("isArchived", false),
			)
			.order("desc")
			.collect();

		const chatsWithParent = await Promise.all(
			chats.map(async (chat) => {
				const currentChat = selectChatFields(chat);
				if (chat.isBranched && chat.parentChatId) {
					const parentChat = await ctx.db.get(chat.parentChatId);
					return {
						...currentChat,
						parentChat: {
							id: parentChat?._id,
							uuid: parentChat?.uuid,
							title: parentChat?.title,
						},
					};
				}
				return { ...currentChat, parentChat: null };
			}),
		);

		return chatsWithParent;
	},
});

export const getPinnedChats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_user_and_pinned_and_folder_and_archived", (q) =>
				q
					.eq("userId", userId)
					.eq("isPinned", true)
					.eq("folderId", undefined)
					.eq("isArchived", false),
			)
			.order("desc")
			.collect();

		const chatsWithParent = await Promise.all(
			chats.map(async (chat) => {
				const currentChat = selectChatFields(chat);
				if (chat.isBranched && chat.parentChatId) {
					const parentChat = await ctx.db.get(chat.parentChatId);
					return {
						...currentChat,
						parentChat: {
							id: parentChat?._id,
							uuid: parentChat?.uuid,
							title: parentChat?.title,
						},
					};
				}
				return { ...currentChat, parentChat: null };
			}),
		);

		return chatsWithParent;
	},
});

export const createChat = mutation({
	args: { uuid: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const newChatId = await ctx.db.insert("chats", {
			uuid: args.uuid,
			userId,
			title: "Generating title..",
			isPinned: false,
			isBranched: false,
			isArchived: false,
		});

		return newChatId;
	},
});

export const updateChatTitle = mutation({
	args: {
		chat: v.object({
			chatId: v.id("chats"),
			title: v.string(),
		}),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const chat = await ctx.db.get(args.chat.chatId);
		if (!chat) {
			throw new Error("Not found!");
		}
		if (chat.userId !== userId) {
			throw new Error("Unauthorized request");
		}
		await ctx.db.patch(args.chat.chatId, { title: args.chat.title });
	},
});

export const toggleChatPin = mutation({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const chat = await ctx.db.get(args.chatId);
		if (!chat) {
			throw new Error("Invalid chat request");
		}
		if (chat.userId !== userId) {
			throw new Error("Unauthorized request");
		}
		await ctx.db.patch(args.chatId, { isPinned: !chat.isPinned });
		return chat.isPinned;
	},
});

export const getArchivedChats = query({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_user_and_archived", (q) =>
				q.eq("userId", userId).eq("isArchived", true),
			)
			.order("desc")
			.collect();

		const selectedFieldsChats = chats.map((chat) => selectChatFields(chat));

		return selectedFieldsChats;
	},
});

export const getChat = query({
	args: { chatId: v.string() },
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chat = await ctx.db
			.query("chats")
			.withIndex("by_chat_uuid", (q) => q.eq("uuid", args.chatId))
			.first();

		if (!chat || chat.userId !== userId) {
			return null;
		}

		return selectChatFields(chat);
	},
});

export const toggleChatArchive = mutation({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const chat = await ctx.db.get(args.chatId);
		if (!chat) {
			throw new Error("Invalid chat request");
		}
		if (chat.userId !== userId) {
			throw new Error("Unauthorized request");
		}
		await ctx.db.patch(args.chatId, { isArchived: !chat.isArchived });
		return chat.isArchived;
	},
});

export const archiveAll = mutation({
	args: {
		chatIds: v.array(v.id("chats")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		for (const chatId of args.chatIds) {
			const chat = await ctx.db.get(chatId);
			if (!chat || chat.userId !== userId) continue;
			await ctx.db.patch(chatId, { isArchived: true });
		}
	},
});

export const unarchiveAll = mutation({
	args: {
		chatIds: v.array(v.id("chats")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		for (const chatId of args.chatIds) {
			const chat = await ctx.db.get(chatId);
			if (!chat || chat.userId !== userId) continue;
			await ctx.db.patch(chatId, { isArchived: false });
		}
	},
});

export const deleteChat = mutation({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chat = await ctx.db.get(args.chatId);
		if (!chat) {
			throw new Error("Invalid chat");
		}

		if (chat.userId !== userId) {
			throw new Error("Unauthorized request");
		}

		await ctx.db.delete(args.chatId);
	},
});

export const deleteSharedChatsByParentChat = internalMutation({
	args: {
		chatId: v.string(),
		cursor: v.union(v.string(), v.null()),
	},
	handler: async (ctx, args) => {
		const BATCH_SIZE = 500;
		const {
			page: chats,
			isDone,
			continueCursor,
		} = await ctx.db
			.query("sharedChats")
			.withIndex("by_parent_chat", (q) => q.eq("parentChatUuid", args.chatId))
			.paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null });

		await Promise.all(chats.map((chat) => ctx.db.delete(chat._id)));

		if (!isDone) {
			// Schedule next batch using the continueCursor
			await ctx.scheduler.runAfter(
				0,
				internal.chats.deleteSharedChatsByParentChat,
				{
					chatId: args.chatId,
					cursor: continueCursor,
				},
			);
		}
	},
});

export const createSharedChat = mutation({
	args: {
		chatId: v.id("chats"),
		sharedChatUuid: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chat = await ctx.db.get(args.chatId);
		if (!chat) {
			throw new Error("Invalid request");
		}

		if (chat.userId !== userId) {
			throw new Error("Invalid request");
		}

		// check if an existing sharedChat already exists
		const sharedChat = await ctx.db
			.query("sharedChats")
			.withIndex("by_parent_chat", (q) => q.eq("parentChatUuid", chat.uuid))
			.first();

		if (sharedChat) {
			// if sharedChat is active, deactivate it
			await ctx.db.patch(sharedChat._id, { isActive: !sharedChat.isActive });
			if (sharedChat.isActive) {
				return null;
			}
			return sharedChat.uuid;
		}

		// if no shared chat exists, then create one
		await ctx.db.insert("sharedChats", {
			parentChatUuid: chat.uuid,
			isActive: true,
			uuid: args.sharedChatUuid,
			updatedTime: Date.now(),
		});

		return args.sharedChatUuid;
	},
});

export const getSharedChatStatus = query({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chat = await ctx.db.get(args.chatId);
		if (!chat || chat.userId !== userId) {
			throw new Error("Unauthorized");
		}

		const sharedChat = await ctx.db
			.query("sharedChats")
			.withIndex("by_parent_chat", (q) => q.eq("parentChatUuid", chat.uuid))
			.first();

		return sharedChat?.isActive ? sharedChat.uuid : null;
	},
});

export const syncSharedChat = mutation({
	args: {
		chatId: v.id("chats"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chat = await ctx.db.get(args.chatId);
		if (!chat || chat.userId !== userId) {
			throw new Error("Unauthorized");
		}

		const sharedChat = await ctx.db
			.query("sharedChats")
			.withIndex("by_parent_chat", (q) => q.eq("parentChatUuid", chat.uuid))
			.first();

		if (!sharedChat) {
			throw new Error("No shared chat found");
		}

		await ctx.db.patch(sharedChat._id, { updatedTime: Date.now() });
	},
});

export const branchOffChat = mutation({
	args: {
		parentChatUuid: v.string(),
		branchedChatUuid: v.string(),
		lastMessage: v.object({
			id: v.string(),
			role: v.union(v.literal("user"), v.literal("assistant")),
		}),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserIdOrThrow(ctx);

		// get the chat being branched
		const parentChat = await ctx.db
			.query("chats")
			.withIndex("by_chat_uuid", (q) => q.eq("uuid", args.parentChatUuid))
			.first();

		// check if chat exists
		if (!parentChat) {
			throw new Error("Invalid chat");
		}

		// create duplicate chat record with same details as original chat
		const branchedChatId = await ctx.db.insert("chats", {
			isBranched: true, // flag = true
			isPinned: false,
			title: parentChat.title,
			userId: user,
			uuid: args.branchedChatUuid,
			parentChatId: parentChat._id,
			isArchived: false,
		});

		// get newly inserted branched chat
		const branchedChat = await ctx.db.get(branchedChatId);

		// throw error if not found
		if (!branchedChat) {
			throw new Error("Branched chat not found!");
		}

		// get message at which chat was branched off
		const lastMessage = await ctx.db
			.query("messages")
			.withIndex("by_source_id", (q) =>
				q.eq("sourceMessageId", args.lastMessage.id),
			)
			.first();

		// throw error if message not found
		if (!lastMessage) {
			throw new Error("Message not found");
		}

		// get all messages before the message on which chat was branched off
		// exclude current message if last message is a user message
		let messagesTillBranchedMessage = await ctx.db
			.query("messages")
			.withIndex("by_chat", (q) =>
				q
					.eq("chatId", parentChat.uuid)
					.lt("_creationTime", lastMessage._creationTime),
			)
			.collect();

		if (args.lastMessage.role === "assistant") {
			messagesTillBranchedMessage = await ctx.db
				.query("messages")
				.withIndex("by_chat", (q) =>
					q
						.eq("chatId", parentChat.uuid)
						.lte("_creationTime", lastMessage._creationTime),
				)
				.collect();
		}

		// insert parent chat's messages but for new branchedChat
		await Promise.all(
			messagesTillBranchedMessage.map(async (message) => {
				const newMessageId = generateRandomUUID();

				await ctx.db.insert("messages", {
					chatId: branchedChat.uuid,
					parts: message.parts,
					role: message.role,
					metadata: message.metadata,
					userId: user,
					sourceMessageId: newMessageId,
				});
			}),
		);
	},
});

export const updateChatFolder = mutation({
	args: {
		chatId: v.id("chats"),
		folderId: v.optional(v.id("folders")),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserIdOrThrow(ctx);
		const chat = await ctx.db.get(args.chatId);
		if (!chat) {
			throw new Error("Not found!");
		}
		if (chat.userId !== userId) {
			throw new Error("Unauthorized request");
		}
		await ctx.db.patch(args.chatId, { folderId: args.folderId });
	},
});

export const deleteChatsByFolder = internalMutation({
	args: {
		userId: v.id("users"),
		folderId: v.id("folders"),
		cursor: v.union(v.string(), v.null()),
	},
	handler: async (ctx, args) => {
		const BATCH_SIZE = 500;
		const {
			page: chats,
			isDone,
			continueCursor,
		} = await ctx.db
			.query("chats")
			.withIndex("by_folder_and_user", (q) =>
				q.eq("userId", args.userId).eq("folderId", args.folderId),
			)
			.paginate({ numItems: BATCH_SIZE, cursor: args.cursor ?? null });

		await Promise.all(chats.map((chat) => ctx.db.delete(chat._id)));

		if (!isDone) {
			// Schedule next batch
			await ctx.scheduler.runAfter(0, internal.chats.deleteChatsByFolder, {
				userId: args.userId,
				folderId: args.folderId,
				cursor: continueCursor,
			});
		}
	},
});

export const deleteAll = mutation({
	handler: async (ctx) => {
		const userId = await getAuthUserIdOrThrow(ctx);

		const chats = await ctx.db
			.query("chats")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		await Promise.all(chats.map((chat) => ctx.db.delete(chat._id)));
	},
});
