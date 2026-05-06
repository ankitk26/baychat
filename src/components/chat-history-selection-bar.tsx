import { ArchiveBoxIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import {
	chatHistorySelectionActions,
	useChatHistorySelectionStore,
} from "~/stores/chat-history-selection-store";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type Props = {
	isArchived: boolean;
	isAllSelected: boolean;
	onSelectAll: () => void;
	onArchiveAction: () => void;
	onDeleteAction: () => void;
	isDeletePending: boolean;
};

export default function ChatHistorySelectionBar({
	isArchived,
	isAllSelected,
	onSelectAll,
	onArchiveAction,
	onDeleteAction,
	isDeletePending,
}: Props) {
	const selectedCount = useChatHistorySelectionStore((s) =>
		isArchived ? s.selectedArchivedChatIds.length : s.selectedChatIds.length,
	);

	const handleClear = () => {
		if (isArchived) {
			chatHistorySelectionActions.clearArchivedChatSelection();
		} else {
			chatHistorySelectionActions.clearChatSelection();
		}
	};

	const archiveLabel = isArchived ? "Unarchive" : "Archive";

	return (
		<div className="absolute right-0 bottom-0 left-0 z-20 flex items-center justify-between rounded-b-lg border-t bg-background/95 px-3 py-2 backdrop-blur-sm">
			<div className="flex items-center gap-2">
				<Button
					className="h-7 px-2 text-xs"
					size="sm"
					variant="ghost"
					onClick={onSelectAll}
				>
					{isAllSelected ? "Deselect all" : "Select all"}
				</Button>
				<Button
					className="h-7 px-2 text-xs"
					size="sm"
					variant="ghost"
					onClick={handleClear}
				>
					<XIcon className="mr-1 h-3 w-3" />
					Clear
				</Button>
			</div>
			<div className="flex items-center gap-2">
				<Button
					className="h-7 gap-1 px-2 text-xs"
					size="sm"
					variant="secondary"
					onClick={onArchiveAction}
				>
					<ArchiveBoxIcon className="h-3 w-3" />
					{archiveLabel} {selectedCount}
				</Button>
				<AlertDialog>
					<AlertDialogTrigger
						render={
							<Button
								className="h-7 px-2 text-xs"
								size="sm"
								variant="destructive"
							/>
						}
					>
						<TrashIcon className="mr-1 h-3 w-3" />
						Delete {selectedCount}
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Delete {selectedCount} conversation
								{selectedCount > 1 ? "s" : ""}
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete these conversations? This action
								cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								disabled={isDeletePending}
								onClick={onDeleteAction}
							>
								{isDeletePending ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
