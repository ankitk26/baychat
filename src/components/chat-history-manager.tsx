import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { toast } from "sonner";
import { groupChatsByDate } from "~/lib/group-chats-by-date";
import {
	chatHistorySelectionActions,
	useChatHistorySelectionStore,
} from "~/stores/chat-history-selection-store";
import ChatHistoryArchivedToggle from "./chat-history-archived-toggle";
import ChatHistoryEmpty from "./chat-history-empty";
import ChatHistoryGroupedList from "./chat-history-grouped-list";
import ChatHistoryHeader from "./chat-history-header";
import ChatHistoryLoading from "./chat-history-loading";
import ChatHistorySearch from "./chat-history-search";
import ChatHistorySelectionBar from "./chat-history-selection-bar";
import { TabsContent } from "./ui/tabs";

export default function ChatHistoryManager() {
	const selectedChatIds = useChatHistorySelectionStore(
		(s) => s.selectedChatIds,
	);
	const selectedArchivedChatIds = useChatHistorySelectionStore(
		(s) => s.selectedArchivedChatIds,
	);
	const showArchived = useChatHistorySelectionStore((s) => s.showArchived);
	const searchQuery = useChatHistorySelectionStore((s) => s.searchQuery);

	const { data: chats = [], isLoading } = useQuery(
		convexQuery(api.chats.getChats, {}),
	);

	const { data: archivedChats = [] } = useQuery(
		convexQuery(api.chats.getArchivedChats, {}),
	);

	const deleteChatMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.deleteChat),
		onSuccess: () => {
			toast.success("Chat deleted");
			chatHistorySelectionActions.clearChatSelection();
		},
		onError: () => {
			toast.error("Failed to delete chats", {
				description: "Please try again later",
			});
		},
	});

	const toggleArchiveMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.toggleChatArchive),
		onSuccess: (wasArchived) => {
			toast.success(wasArchived ? "Chat unarchived" : "Chat archived");
			if (wasArchived) {
				chatHistorySelectionActions.clearArchivedChatSelection();
			} else {
				chatHistorySelectionActions.clearChatSelection();
			}
		},
		onError: () => {
			toast.error("Failed to archive chat", {
				description: "Please try again later",
			});
		},
	});

	const archiveAllMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.archiveAll),
		onSuccess: () => {
			toast.success("Chats archived");
			chatHistorySelectionActions.clearChatSelection();
		},
		onError: () => {
			toast.error("Failed to archive chats", {
				description: "Please try again later",
			});
		},
	});

	const unarchiveAllMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.unarchiveAll),
		onSuccess: () => {
			toast.success("Chats unarchived");
			chatHistorySelectionActions.clearArchivedChatSelection();
		},
		onError: () => {
			toast.error("Failed to unarchive chats", {
				description: "Please try again later",
			});
		},
	});

	const filteredChats = !searchQuery.trim()
		? chats
		: chats.filter((chat) =>
				chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
			);

	const groupedChats = groupChatsByDate(filteredChats);
	const groupedArchived = groupChatsByDate(archivedChats);

	const isAllSelected =
		filteredChats.length > 0 && selectedChatIds.length === filteredChats.length;

	const isAllArchivedSelected =
		selectedArchivedChatIds.length === archivedChats.length;

	const hasSearchQuery = searchQuery.trim().length > 0;

	const handleToggleArchive = (chatId: string) => {
		toggleArchiveMutation.mutate({ chatId: chatId as Id<"chats"> });
	};

	const handleDeleteSingle = (chatId: string) => {
		deleteChatMutation.mutate({ chatId: chatId as Id<"chats"> });
	};

	const handleSelectAll = () => {
		if (selectedChatIds.length === filteredChats.length) {
			chatHistorySelectionActions.clearChatSelection();
		} else {
			chatHistorySelectionActions.selectAllChats(
				filteredChats.map((chat) => chat._id),
			);
		}
	};

	const handleSelectAllArchived = () => {
		if (selectedArchivedChatIds.length === archivedChats.length) {
			chatHistorySelectionActions.clearArchivedChatSelection();
		} else {
			chatHistorySelectionActions.selectAllArchivedChats(
				archivedChats.map((chat) => chat._id),
			);
		}
	};

	const handleArchiveSelected = () => {
		if (selectedChatIds.length === 0) return;
		archiveAllMutation.mutate({
			chatIds: selectedChatIds as Id<"chats">[],
		});
	};

	const handleDeleteSelected = () => {
		if (selectedChatIds.length === 0) return;
		for (const chatId of selectedChatIds) {
			const chat = chats.find((c) => c._id === chatId);
			if (chat) deleteChatMutation.mutate({ chatId: chat._id });
		}
	};

	const handleUnarchiveSelected = () => {
		if (selectedArchivedChatIds.length === 0) return;
		unarchiveAllMutation.mutate({
			chatIds: selectedArchivedChatIds as Id<"chats">[],
		});
	};

	const handleDeleteSelectedArchived = () => {
		if (selectedArchivedChatIds.length === 0) return;
		for (const chatId of selectedArchivedChatIds) {
			const chat = archivedChats.find((c) => c._id === chatId);
			if (chat) deleteChatMutation.mutate({ chatId: chat._id });
		}
		chatHistorySelectionActions.clearArchivedChatSelection();
	};

	return (
		<TabsContent className="space-y-5" value="chatHistory">
			<ChatHistoryHeader totalChatCount={chats.length} isLoading={isLoading} />

			{chats.length > 0 && <ChatHistorySearch />}

			{isLoading && <ChatHistoryLoading />}

			{!isLoading && filteredChats.length === 0 && (
				<ChatHistoryEmpty
					description={
						hasSearchQuery
							? "Try a different search term"
							: "Your chat history will appear here"
					}
					title={hasSearchQuery ? "No matches found" : "No conversations yet"}
				/>
			)}

			{!isLoading && filteredChats.length > 0 && (
				<div className="relative rounded-lg border">
					<ChatHistoryGroupedList
						groups={groupedChats}
						onDeleteSingle={handleDeleteSingle}
						onToggleArchive={handleToggleArchive}
					/>
					{selectedChatIds.length > 0 && (
						<ChatHistorySelectionBar
							isAllSelected={isAllSelected}
							isArchived={false}
							isDeletePending={deleteChatMutation.isPending}
							onArchiveAction={handleArchiveSelected}
							onDeleteAction={handleDeleteSelected}
							onSelectAll={handleSelectAll}
						/>
					)}
				</div>
			)}

			<ChatHistoryArchivedToggle archivedChatCount={archivedChats.length} />

			{showArchived && archivedChats.length > 0 && (
				<div className="relative rounded-lg border">
					<ChatHistoryGroupedList
						groups={groupedArchived}
						isArchived
						maxHeight="h-[300px]"
						onDeleteSingle={handleDeleteSingle}
						onToggleArchive={handleToggleArchive}
					/>
					{selectedArchivedChatIds.length > 0 && (
						<ChatHistorySelectionBar
							isAllSelected={isAllArchivedSelected}
							isArchived
							isDeletePending={deleteChatMutation.isPending}
							onArchiveAction={handleUnarchiveSelected}
							onDeleteAction={handleDeleteSelectedArchived}
							onSelectAll={handleSelectAllArchived}
						/>
					)}
				</div>
			)}

			{showArchived && archivedChats.length === 0 && (
				<ChatHistoryEmpty
					description="Archive a conversation to see it here"
					title="No archived chats"
				/>
			)}
		</TabsContent>
	);
}
