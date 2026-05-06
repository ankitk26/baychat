import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	ArchiveBoxIcon,
	CheckIcon,
	ChatTeardropTextIcon,
	GitBranchIcon,
	MagnifyingGlassIcon,
	TrashIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";
import { groupChatsByDate } from "~/lib/group-chats-by-date";
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
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Switch } from "./ui/switch";
import { TabsContent } from "./ui/tabs";

export default function ChatHistoryManager() {
	const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
	const [selectedArchivedChats, setSelectedArchivedChats] = useState<
		Set<string>
	>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [showArchived, setShowArchived] = useState(false);

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
			setSelectedChats(new Set());
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
			setSelectedChats(new Set());
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
			setSelectedArchivedChats(new Set());
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

	const handleSelectChat = (chatId: string) => {
		const newSelected = new Set(selectedChats);
		if (newSelected.has(chatId)) {
			newSelected.delete(chatId);
		} else {
			newSelected.add(chatId);
		}
		setSelectedChats(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedChats.size === filteredChats.length) {
			setSelectedChats(new Set());
		} else {
			setSelectedChats(new Set(filteredChats.map((chat) => chat._id)));
		}
	};

	const handleDeleteSelected = () => {
		if (selectedChats.size === 0) return;
		for (const chatId of selectedChats) {
			const chat = chats.find((c) => c._id === chatId);
			if (chat) deleteChatMutation.mutate({ chatId: chat._id });
		}
	};

	const handleArchiveSelected = () => {
		if (selectedChats.size === 0) return;
		archiveAllMutation.mutate({
			chatIds: [...selectedChats] as Id<"chats">[],
		});
	};

	const handleDeleteSingle = (chat: (typeof chats)[number]) => {
		deleteChatMutation.mutate({ chatId: chat._id });
	};

	const handleToggleArchive = (
		chat: (typeof chats)[number],
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		toggleArchiveMutation.mutate({ chatId: chat._id });
	};

	const handleSelectArchivedChat = (chatId: string) => {
		const newSelected = new Set(selectedArchivedChats);
		if (newSelected.has(chatId)) {
			newSelected.delete(chatId);
		} else {
			newSelected.add(chatId);
		}
		setSelectedArchivedChats(newSelected);
	};

	const handleSelectAllArchived = () => {
		if (selectedArchivedChats.size === archivedChats.length) {
			setSelectedArchivedChats(new Set());
		} else {
			setSelectedArchivedChats(new Set(archivedChats.map((chat) => chat._id)));
		}
	};

	const handleDeleteSelectedArchived = () => {
		if (selectedArchivedChats.size === 0) return;
		for (const chatId of selectedArchivedChats) {
			const chat = archivedChats.find((c) => c._id === chatId);
			if (chat) deleteChatMutation.mutate({ chatId: chat._id });
		}
		setSelectedArchivedChats(new Set());
	};

	const handleUnarchiveSelected = () => {
		if (selectedArchivedChats.size === 0) return;
		unarchiveAllMutation.mutate({
			chatIds: [...selectedArchivedChats] as Id<"chats">[],
		});
	};

	const formatDate = (timestamp: number) =>
		new Date(timestamp).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
		});

	const isAllSelected =
		filteredChats.length > 0 && selectedChats.size === filteredChats.length;

	const renderChatRow = (
		chat: (typeof chats)[number],
		{
			isArchived = false,
			selectionSet,
			onSelect,
		}: {
			isArchived?: boolean;
			selectionSet: Set<string>;
			onSelect: (chatId: string) => void;
		},
	) => {
		const isSelected = selectionSet.has(chat._id);
		return (
			<div
				className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
				key={chat._id}
				onClick={() => onSelect(chat._id)}
			>
				{/* Checkbox */}
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

				{/* Info */}
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

				{/* Hover actions */}
				<div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
					<Button
						className="h-6 w-6 shrink-0"
						size="icon"
						variant="ghost"
						onClick={(e) => handleToggleArchive(chat, e)}
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
									onClick={(e) => e.stopPropagation()}
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
									onClick={() => handleDeleteSingle(chat)}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		);
	};

	return (
		<TabsContent className="space-y-5" value="chatHistory">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="text-base font-semibold text-foreground">
						Chat History
					</h3>
					{!isLoading && (
						<Badge
							className="h-5 px-1.5 text-[0.625rem] font-medium"
							variant="secondary"
						>
							{chats.length}
						</Badge>
					)}
				</div>
			</div>

			{/* Search */}
			{chats.length > 0 && (
				<div className="relative">
					<MagnifyingGlassIcon className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-8 rounded-lg border bg-transparent py-0 pl-8 text-xs"
						placeholder="Search conversations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			)}

			{/* Content */}
			{isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div className="space-y-2" key={`skeleton-${i}`}>
							<Skeleton className="h-3 w-20" />
							<div className="space-y-1">
								{Array.from({ length: 2 }).map((_, j) => (
									<div
										className="flex items-center gap-3 rounded-lg px-2 py-2"
										key={`skeleton-item-${i}-${j}`}
									>
										<Skeleton className="h-4 w-4 rounded-sm" />
										<div className="flex-1 space-y-1.5">
											<Skeleton className="h-3.5 w-3/4" />
											<Skeleton className="h-2.5 w-1/4" />
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			) : filteredChats.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border py-14 text-center">
					<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
						<ChatTeardropTextIcon className="h-4 w-4 text-muted-foreground" />
					</div>
					<p className="text-sm font-medium text-foreground">
						{searchQuery ? "No matches found" : "No conversations yet"}
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						{searchQuery
							? "Try a different search term"
							: "Your chat history will appear here"}
					</p>
				</div>
			) : (
				<div className="relative rounded-lg border">
					<ScrollArea className="h-[420px]">
						<div
							className={`space-y-5 p-3 ${selectedChats.size > 0 ? "pb-14" : ""}`}
						>
							{groupedChats.map(({ group, chats: groupChats }) => (
								<div className="space-y-1" key={group}>
									<h4 className="sticky top-0 z-10 bg-background px-2 py-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
										{group}
									</h4>
									<div className="space-y-0.5">
										{groupChats.map((chat) =>
											renderChatRow(chat, {
												selectionSet: selectedChats,
												onSelect: handleSelectChat,
											}),
										)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>

					{/* Floating selection bar */}
					{selectedChats.size > 0 && (
						<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-lg border-t bg-background/95 px-3 py-2 backdrop-blur-sm">
							<div className="flex items-center gap-2">
								<Button
									className="h-7 px-2 text-xs"
									size="sm"
									variant="ghost"
									onClick={handleSelectAll}
								>
									{isAllSelected ? "Deselect all" : "Select all"}
								</Button>
								<Button
									className="h-7 px-2 text-xs"
									size="sm"
									variant="ghost"
									onClick={() => setSelectedChats(new Set())}
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
									onClick={handleArchiveSelected}
								>
									<ArchiveBoxIcon className="h-3 w-3" />
									Archive {selectedChats.size}
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
										Delete {selectedChats.size}
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Delete {selectedChats.size} conversation
												{selectedChats.size > 1 ? "s" : ""}
											</AlertDialogTitle>
											<AlertDialogDescription>
												Are you sure you want to delete these conversations?
												This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												variant="destructive"
												disabled={deleteChatMutation.isPending}
												onClick={handleDeleteSelected}
											>
												{deleteChatMutation.isPending
													? "Deleting..."
													: "Delete"}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Archived chats toggle */}
			{archivedChats.length > 0 && (
				<div className="mt-6 flex items-center gap-3">
					<Switch
						checked={showArchived}
						onCheckedChange={setShowArchived}
						size="sm"
						id="show-archived"
					/>
					<Label
						className="cursor-pointer text-sm text-muted-foreground"
						htmlFor="show-archived"
					>
						Archived chats
					</Label>
					{showArchived && (
						<Badge
							className="h-4 px-1 text-[0.625rem] font-medium"
							variant="secondary"
						>
							{archivedChats.length}
						</Badge>
					)}
				</div>
			)}

			{/* Archived chats list */}
			{showArchived && archivedChats.length > 0 && (
				<div className="relative rounded-lg border">
					<ScrollArea className="max-h-[300px]">
						<div
							className={`space-y-5 p-3 ${selectedArchivedChats.size > 0 ? "pb-14" : ""}`}
						>
							{groupedArchived.map(({ group, chats: groupChats }) => (
								<div className="space-y-1" key={`archived-${group}`}>
									<h4 className="sticky top-0 z-10 bg-background px-2 py-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
										{group}
									</h4>
									<div className="space-y-0.5">
										{groupChats.map((chat) =>
											renderChatRow(chat, {
												isArchived: true,
												selectionSet: selectedArchivedChats,
												onSelect: handleSelectArchivedChat,
											}),
										)}
									</div>
								</div>
							))}
						</div>
					</ScrollArea>

					{/* Floating selection bar for archived */}
					{selectedArchivedChats.size > 0 && (
						<div className="absolute right-0 bottom-0 left-0 flex items-center justify-between rounded-b-lg border-t bg-background/95 px-3 py-2 backdrop-blur-sm">
							<div className="flex items-center gap-2">
								<Button
									className="h-7 px-2 text-xs"
									size="sm"
									variant="ghost"
									onClick={handleSelectAllArchived}
								>
									{selectedArchivedChats.size === archivedChats.length
										? "Deselect all"
										: "Select all"}
								</Button>
								<Button
									className="h-7 px-2 text-xs"
									size="sm"
									variant="ghost"
									onClick={() => setSelectedArchivedChats(new Set())}
								>
									<XIcon className="mr-1 h-3 w-3" />
									Clear
								</Button>
							</div>
							<div className="flex items-center gap-2">
								<Button
									className="h-7 px-2 text-xs"
									size="sm"
									variant="secondary"
									onClick={handleUnarchiveSelected}
								>
									<ArchiveBoxIcon className="mr-1 h-3 w-3" />
									Unarchive {selectedArchivedChats.size}
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
										Delete {selectedArchivedChats.size}
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												Delete {selectedArchivedChats.size} conversation
												{selectedArchivedChats.size > 1 ? "s" : ""}
											</AlertDialogTitle>
											<AlertDialogDescription>
												Are you sure you want to delete these conversations?
												This action cannot be undone.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												variant="destructive"
												disabled={deleteChatMutation.isPending}
												onClick={handleDeleteSelectedArchived}
											>
												{deleteChatMutation.isPending
													? "Deleting..."
													: "Delete"}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					)}
				</div>
			)}
		</TabsContent>
	);
}
