import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
	chatHistorySelectionActions,
	useChatHistorySelectionStore,
} from "~/stores/chat-history-selection-store";
import { Input } from "./ui/input";

export default function ChatHistorySearch() {
	const searchQuery = useChatHistorySelectionStore((s) => s.searchQuery);

	return (
		<div className="relative">
			<MagnifyingGlassIcon className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
			<Input
				className="h-8 rounded-lg border bg-transparent py-0 pl-8 text-xs"
				placeholder="Search conversations..."
				value={searchQuery}
				onChange={(e) =>
					chatHistorySelectionActions.setSearchQuery(e.target.value)
				}
			/>
		</div>
	);
}
