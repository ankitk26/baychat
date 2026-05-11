import { cn } from "~/lib/utils";
import { useChatHistorySelectionStore } from "~/stores/chat-history-selection-store";
import type { ChatHistoryItem } from "~/types";
import ChatHistoryItemComponent from "./chat-history-item";
import { ScrollArea } from "./ui/scroll-area";

type Props = {
	groups: { group: string; chats: ChatHistoryItem[] }[];
	isArchived?: boolean;
	onToggleArchive: (chatId: string) => void;
	onDeleteSingle: (chatId: string) => void;
	maxHeight?: string;
};

export default function ChatHistoryGroupedList({
	groups,
	isArchived = false,
	onToggleArchive,
	onDeleteSingle,
	maxHeight = "h-[420px]",
}: Props) {
	const hasSelection = useChatHistorySelectionStore((s) =>
		isArchived
			? s.selectedArchivedChatIds.length > 0
			: s.selectedChatIds.length > 0,
	);

	return (
		<ScrollArea className={maxHeight}>
			<div className={cn("space-y-5 p-3", hasSelection && "pb-14")}>
				{groups.map(({ group, chats }) => (
					<div className="space-y-1" key={group}>
						<h4 className="sticky top-0 z-10 bg-background px-2 py-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
							{group}
						</h4>
						<div className="space-y-0.5">
							{chats.map((chat) => (
								<ChatHistoryItemComponent
									chat={chat}
									isArchived={isArchived}
									key={chat._id}
									onDelete={onDeleteSingle}
									onToggleArchive={onToggleArchive}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
