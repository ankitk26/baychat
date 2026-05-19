import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createContext, type ReactNode, useContext, useState } from "react";
import type { CustomUIMessage } from "~/types";

type ChatContextValue = {
	chat: Chat<CustomUIMessage>;
	clearChat: () => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function createChat() {
	return new Chat<CustomUIMessage>({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});
}

export function ChatProvider({ children }: { children: ReactNode }) {
	const [chat, setChat] = useState(() => createChat());

	const clearChat = () => {
		setChat(createChat());
	};

	return (
		<ChatContext.Provider
			value={{
				chat,
				clearChat,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
}

export function useOptionalSharedChatContext() {
	return useContext(ChatContext);
}

export function useSharedChatContext() {
	const context = useOptionalSharedChatContext();
	if (!context) {
		throw new Error("useSharedChatContext must be used within a ChatProvider");
	}
	return context;
}
