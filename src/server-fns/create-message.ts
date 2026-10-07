import { createServerFn } from "@tanstack/react-start";
import { api } from "convex/_generated/api";
import { z } from "zod";
import { fetchAuthMutation } from "~/lib/auth-server";
import { getAuthUser } from "./get-auth";

export const createMessageServerFn = createServerFn({ method: "POST" })
	.validator(
		z.object({
			chatId: z.string(),
			parts: z.string(),
			metadata: z.string().default(""),
			messageId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const authData = await getAuthUser();
		if (!authData) {
			throw new Error("Invalid request");
		}

		await fetchAuthMutation(api.messages.createMessage, {
			messageBody: {
				chatId: data.chatId,
				parts: data.parts,
				role: "assistant",
				metadata: data.metadata,
				sourceMessageId: data.messageId,
			},
		});
	});
