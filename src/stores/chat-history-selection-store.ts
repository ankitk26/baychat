import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

interface ChatHistorySelectionState {
	selectedChatIds: string[];
	selectedArchivedChatIds: string[];
	searchQuery: string;
	showArchived: boolean;
}

const chatHistorySelectionStore = new Store<ChatHistorySelectionState>({
	selectedChatIds: [],
	selectedArchivedChatIds: [],
	searchQuery: "",
	showArchived: false,
});

export const useChatHistorySelectionStore = <T>(
	selector: (state: ChatHistorySelectionState) => T,
): T => useSelector(chatHistorySelectionStore, selector);

export const chatHistorySelectionActions = {
	toggleChat: (chatId: string) => {
		chatHistorySelectionStore.setState((prev) => {
			const has = prev.selectedChatIds.includes(chatId);
			return {
				...prev,
				selectedChatIds: has
					? prev.selectedChatIds.filter((id) => id !== chatId)
					: [...prev.selectedChatIds, chatId],
			};
		});
	},
	selectAllChats: (chatIds: string[]) => {
		chatHistorySelectionStore.setState((prev) => ({
			...prev,
			selectedChatIds: [...chatIds],
		}));
	},
	clearChatSelection: () => {
		chatHistorySelectionStore.setState((prev) => ({
			...prev,
			selectedChatIds: [],
		}));
	},
	toggleArchivedChat: (chatId: string) => {
		chatHistorySelectionStore.setState((prev) => {
			const has = prev.selectedArchivedChatIds.includes(chatId);
			return {
				...prev,
				selectedArchivedChatIds: has
					? prev.selectedArchivedChatIds.filter((id) => id !== chatId)
					: [...prev.selectedArchivedChatIds, chatId],
			};
		});
	},
	selectAllArchivedChats: (chatIds: string[]) => {
		chatHistorySelectionStore.setState((prev) => ({
			...prev,
			selectedArchivedChatIds: [...chatIds],
		}));
	},
	clearArchivedChatSelection: () => {
		chatHistorySelectionStore.setState((prev) => ({
			...prev,
			selectedArchivedChatIds: [],
		}));
	},
	setSearchQuery: (query: string) => {
		chatHistorySelectionStore.setState((prev) => ({
			...prev,
			searchQuery: query,
		}));
	},
	setShowArchived: (show: boolean) => {
		chatHistorySelectionStore.setState((prev) => ({
			...prev,
			showArchived: show,
		}));
	},
};
