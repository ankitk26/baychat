import { mutation } from "convex/_generated/server";

export const setAllChatsUnarchived = mutation({
	handler: async (ctx) => {
		const chats = await ctx.db.query("chats").collect();

		await Promise.all(
			chats.map((chat) => {
				ctx.db.patch("chats", chat._id, {
					isArchived: false,
				});
			}),
		);
	},
});
