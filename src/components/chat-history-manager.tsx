import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	CheckIcon,
	ChatTeardropTextIcon,
	GitBranchIcon,
	MagnifyingGlassIcon,
	TrashIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
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
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { TabsContent } from "./ui/tabs";

export default function ChatHistoryManager() {
	const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");

	const { data: chats = [], isLoading } = useQuery(
		convexQuery(api.chats.getChats, {}),
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

	const filteredChats = !searchQuery.trim()
		? chats
		: chats.filter((chat) =>
				chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
			);

	const groupedChats = groupChatsByDate(filteredChats);

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

	const handleDeleteSingle = (chat: (typeof chats)[number]) => {
		deleteChatMutation.mutate({ chatId: chat._id });
	};

	const formatDate = (timestamp: number) =>
		new Date(timestamp).toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short",
		});

	const isAllSelected =
		filteredChats.length > 0 && selectedChats.size === filteredChats.length;

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
										{groupChats.map((chat) => {
											const isSelected = selectedChats.has(chat._id);
											return (
												<div
													className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
													key={chat._id}
													onClick={() => handleSelectChat(chat._id)}
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

													{/* Hover delete */}
													<AlertDialog>
														<AlertDialogTrigger
															render={
																<Button
																	className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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
																<AlertDialogTitle>
																	Delete conversation
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete "{chat.title}
																	"? This action cannot be undone.
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
											);
										})}
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
											Are you sure you want to delete these conversations? This
											action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction
											variant="destructive"
											disabled={deleteChatMutation.isPending}
											onClick={handleDeleteSelected}
										>
											{deleteChatMutation.isPending ? "Deleting..." : "Delete"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					)}
				</div>
			)}
		</TabsContent>
	);
}
