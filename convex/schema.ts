import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		email: v.string(),
		updatedAtTime: v.number(),
		authId: v.string(),
	}).index("by_auth", ["authId"]),

	folders: defineTable({
		title: v.string(),
		userId: v.id("users"),
		defaultModel: v.object({
			id: v.string(),
			name: v.string(),
		}),
	}).index("by_user", ["userId"]),

	chats: defineTable({
		uuid: v.string(),
		title: v.string(),
		userId: v.id("users"),
		isPinned: v.boolean(),
		isBranched: v.boolean(),
		parentChatId: v.optional(v.id("chats")),
		folderId: v.optional(v.id("folders")),
		isArchived: v.boolean(),
	})
		.index("by_chat_uuid", ["uuid"])
		.index("by_user", ["userId"])
		.index("by_user_and_pinned_and_folder_and_archived", [
			"userId",
			"isPinned",
			"folderId",
			"isArchived",
		])
		.index("by_user_and_archived", ["userId", "isArchived"])
		.index("by_folder_and_user", ["userId", "folderId"]),

	messages: defineTable({
		sourceMessageId: v.string(),
		chatId: v.string(),
		userId: v.id("users"),
		parts: v.string(),
		metadata: v.optional(v.string()),
		role: v.union(v.literal("user"), v.literal("assistant")),
	})
		.index("by_user_chat", ["chatId", "userId"])
		.index("by_user_and_role", ["userId", "role"])
		.index("by_chat", ["chatId"])
		.index("by_source_id", ["sourceMessageId"]),

	sharedChats: defineTable({
		parentChatUuid: v.string(),
		uuid: v.string(),
		isActive: v.boolean(),
		updatedTime: v.number(),
	})
		.index("by_parent_chat", ["parentChatUuid"])
		.index("by_uuid", ["uuid"]),

	userTokenUsage: defineTable({
		userId: v.id("users"),
		model: v.string(),
		provider: v.string(),
		tokens: v.float64(),
	}).index("by_user_and_model", ["userId", "model"]),

	imageGenerations: defineTable({
		userId: v.id("users"),
		storageId: v.id("_storage"),
		generatedImageUrl: v.string(),
	})
		.index("by_user", ["userId"])
		.index("by_storage_id", ["storageId"]),

	// Ownership map for non-image files uploaded in prompts.
	uploadedFiles: defineTable({
		userId: v.id("users"),
		storageId: v.id("_storage"),
	})
		.index("by_user", ["userId"])
		.index("by_storage_id", ["storageId"]),
});
