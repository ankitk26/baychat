import type { UseChatHelpers } from "@ai-sdk/react";
import type { ChatStatus } from "ai";
import { memo } from "react";
import type { CustomUIMessage } from "~/types";
import AssistantMessage from "./assistant-message";
import UserMessage from "./user-message";

type Props = {
	chatId: string;
	isGeneratingImage?: boolean;
	latestGeneratedImageUrl?: string | null;
	messages: CustomUIMessage[];
	regenerate: UseChatHelpers<CustomUIMessage>["regenerate"];
	sendMessage: UseChatHelpers<CustomUIMessage>["sendMessage"];
	status: ChatStatus;
	wasStopped: boolean;
};

export default memo(function ChatMessages({
	chatId,
	isGeneratingImage = false,
	latestGeneratedImageUrl,
	messages,
	regenerate,
	sendMessage,
	status,
	wasStopped,
}: Props) {
	if (messages.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6 px-3 lg:space-y-8 lg:px-0">
			{messages.map((message, index) => (
				<div className="flex flex-col" key={message.id}>
					{message.role === "user" ? (
						<UserMessage
							chatId={chatId}
							latestGeneratedImageUrl={latestGeneratedImageUrl}
							message={message}
							regenerate={regenerate}
							sendMessage={sendMessage}
							nextMessage={messages[index + 1]}
						/>
					) : (
						<AssistantMessage
							isGeneratingImage={isGeneratingImage}
							message={message}
							regenerate={regenerate}
							status={status}
							// Only the last assistant message was the one being generated
							// when stop was clicked — older ones should not show the alert.
							wasStopped={
								wasStopped &&
								!messages.slice(index + 1).some((m) => m.role === "assistant")
							}
						/>
					)}
				</div>
			))}
		</div>
	);
});
