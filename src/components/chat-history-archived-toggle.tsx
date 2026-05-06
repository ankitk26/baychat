import {
	chatHistorySelectionActions,
	useChatHistorySelectionStore,
} from "~/stores/chat-history-selection-store";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type Props = {
	archivedChatCount: number;
};

export default function ChatHistoryArchivedToggle({
	archivedChatCount,
}: Props) {
	const showArchived = useChatHistorySelectionStore((s) => s.showArchived);

	return (
		<div className="mt-6 flex items-center gap-3">
			<Switch
				checked={showArchived}
				onCheckedChange={chatHistorySelectionActions.setShowArchived}
				size="sm"
				id="show-archived"
			/>
			<Label
				className="cursor-pointer text-sm text-muted-foreground"
				htmlFor="show-archived"
			>
				Archived chats
			</Label>
			{showArchived && archivedChatCount > 0 && (
				<Badge
					className="h-4 px-1 text-[0.625rem] font-medium"
					variant="secondary"
				>
					{archivedChatCount}
				</Badge>
			)}
		</div>
	);
}
