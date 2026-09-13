import {
	customCtx,
	customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import {
	internalMutation as rawInternalMutation,
	mutation as rawMutation,
	query as rawQuery,
} from "./_generated/server";

const triggers = new Triggers<DataModel>();

triggers.register("chats", async (ctx, change) => {
	if (change.operation === "delete") {
		const chat = change.oldDoc;
		if (!chat) {
			throw new Error("Chat not found");
		}
		await ctx.scheduler.runAfter(0, internal.messages.deleteMessagesByChat, {
			chatId: chat.uuid,
			cursor: null,
		});
		await ctx.scheduler.runAfter(
			0,
			internal.chats.deleteSharedChatsByParentChat,
			{
				chatId: chat.uuid,
				cursor: null,
			},
		);
		await ctx.scheduler.runAfter(
			0,
			internal.savedMessages.deleteSavedByChatInternal,
			{
				chatId: chat.uuid,
				cursor: null,
			},
		);
	}
});

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const query = rawQuery;
export const internalMutation = customMutation(
	rawInternalMutation,
	customCtx(triggers.wrapDB),
);
