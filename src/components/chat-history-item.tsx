import {
	ArchiveBoxIcon,
	CheckIcon,
	GitBranchIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import {
	chatHistorySelectionActions,
	useChatHistorySelectionStore,
} from "~/stores/chat-history-selection-store";
import type { ChatHistoryItem } from "~/types";
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
	chat: ChatHistoryItem;
	isArchived?: boolean;
	onToggleArchive: (chatId: string) => void;
	onDelete: (chatId: string) => void;
};

function formatDate(timestamp: number) {
	return new Date(timestamp).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	});
}

export default function ChatHistoryItem({
	chat,
	isArchived = false,
	onToggleArchive,
	onDelete,
}: Props) {
	const isSelected = useChatHistorySelectionStore((s) =>
		isArchived
			? s.selectedArchivedChatIds.includes(chat._id)
			: s.selectedChatIds.includes(chat._id),
	);

	const handleSelect = () => {
		if (isArchived) {
			chatHistorySelectionActions.toggleArchivedChat(chat._id);
		} else {
			chatHistorySelectionActions.toggleChat(chat._id);
		}
	};

	const handleArchiveClick = (e: MouseEvent) => {
		e.stopPropagation();
		onToggleArchive(chat._id);
	};

	const handleDeleteClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<div
			className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
			onClick={handleSelect}
		>
			<button
				className="pointer-events-none flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all"
				type="button"
				aria-label="Select chat"
				aria-pressed={isSelected}
			>
				{isSelected ? (
					<div className="flex h-full w-full items-center justify-center rounded-sm bg-primary">
						<CheckIcon className="h-3 w-3 text-primary-foreground" />
					</div>
				) : (
					<div className="h-full w-full rounded-sm bg-muted/20 group-hover:bg-muted/40" />
				)}
			</button>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					{chat.isBranched && (
						<GitBranchIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
					)}
					<span className="truncate text-sm font-medium text-foreground">
						{chat.title}
					</span>
				</div>
				<p className="text-xs text-muted-foreground">
					{formatDate(chat._creationTime)}
				</p>
			</div>

			<div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
				<Button
					className="h-6 w-6 shrink-0"
					size="icon"
					variant="ghost"
					onClick={handleArchiveClick}
					title={isArchived ? "Unarchive" : "Archive"}
				>
					<ArchiveBoxIcon className="h-3 w-3 text-muted-foreground" />
				</Button>

				<AlertDialog>
					<AlertDialogTrigger
						render={
							<Button
								className="h-6 w-6 shrink-0"
								size="icon"
								variant="ghost"
								onClick={handleDeleteClick}
							/>
						}
					>
						<TrashIcon className="h-3 w-3 text-destructive" />
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete conversation</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "{chat.title}"? This action
								cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								onClick={() => onDelete(chat._id)}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
