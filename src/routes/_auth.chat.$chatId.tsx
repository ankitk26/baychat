import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMemo } from "react";
import Chat from "~/components/chat";
import type { CustomUIMessage } from "~/types";

export const Route = createFileRoute("/_auth/chat/$chatId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { chatId } = Route.useParams();

	const { data: chat, isPending: isChatPending } = useQuery(
		convexQuery(api.chats.getChat, { chatId }),
	);

	const { data: messages, isPending: isMessagesPending } = useQuery(
		convexQuery(api.messages.getMessages, {
			chatId,
		}),
	);

	const transformedMessages = useMemo(() => {
		if (!messages) {
			return [];
		}
		return messages.map((message) => {
			const base = {
				id: message.sourceMessageId,
				role: message.role,
				parts: JSON.parse(message.parts) as CustomUIMessage["parts"],
			};
			if (message.role === "user") {
				return base;
			}
			return {
				...base,
				metadata: JSON.parse(message.metadata ?? "{}"),
			};
		}) as CustomUIMessage[];
	}, [messages]);

	if (!isChatPending && chat === null) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center">
				<div className="space-y-2 text-center">
					<h1 className="text-xl font-semibold">Chat does not exist or was deleted</h1>
				</div>
			</div>
		);
	}

	return (
		<Chat
			chatId={chatId}
			dbMessages={transformedMessages}
			isMessagesPending={isMessagesPending}
		/>
	);
}
