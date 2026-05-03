import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import type { Id } from "convex/_generated/dataModel";

type Chat = {
	_id: Id<"chats">;
	title: string;
	uuid: string;
};

type ChatActionState = {
	selectedChat: Chat | null;
	isDeleteModalOpen: boolean;
	isRenameModalOpen: boolean;
	isShareDialogOpen: boolean;
};

const chatActionStore = new Store<ChatActionState>({
	selectedChat: null,
	isDeleteModalOpen: false,
	isRenameModalOpen: false,
	isShareDialogOpen: false,
});

export const useChatActionStore = <T>(
	selector: (state: ChatActionState) => T,
): T => useSelector(chatActionStore, selector);

export const chatActionStoreActions = {
	setSelectedChat: (chat: Chat | null) => {
		chatActionStore.setState((prev) => ({ ...prev, selectedChat: chat }));
	},
	setIsDeleteModalOpen: (value: boolean) => {
		chatActionStore.setState((prev) => ({ ...prev, isDeleteModalOpen: value }));
	},
	setIsRenameModalOpen: (value: boolean) => {
		chatActionStore.setState((prev) => ({ ...prev, isRenameModalOpen: value }));
	},
	setIsShareDialogOpen: (value: boolean) => {
		chatActionStore.setState((prev) => ({ ...prev, isShareDialogOpen: value }));
	},
};
