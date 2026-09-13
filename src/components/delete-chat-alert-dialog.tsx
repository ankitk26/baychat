import { useConvexMutation, convexQuery } from "@convex-dev/react-query";
import { BookmarkSimpleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSharedChatContext } from "~/providers/chat-provider";
import {
	chatActionStoreActions,
	useChatActionStore,
} from "~/stores/chat-actions-store";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";

export default function DeleteChatAlertDialog() {
	const { clearChat } = useSharedChatContext();
	const { chatId } = useParams({ strict: false });
	const navigate = useNavigate();
	const selectedChat = useChatActionStore((store) => store.selectedChat);
	const isDeleteModalOpen = useChatActionStore(
		(store) => store.isDeleteModalOpen,
	);

	// Whether the chat has saved messages decides if the retention
	// warning + checkbox are shown at all.
	const { data: savedMessageCount } = useQuery({
		...convexQuery(api.savedMessages.getSavedMessageCount, {
			chatId: selectedChat?.uuid ?? "",
		}),
		enabled: Boolean(selectedChat) && isDeleteModalOpen,
	});

	const [keepSavedMessages, setKeepSavedMessages] = useState(false);

	// Default to deleting saved messages on every dialog open.
	useEffect(() => {
		if (isDeleteModalOpen) {
			setKeepSavedMessages(false);
		}
	}, [isDeleteModalOpen, selectedChat?._id]);

	const deleteChatMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.deleteChat),
		onSuccess: () => {
			const isCurrentChatOpened = selectedChat?.uuid === chatId;
			toast.success(
				keepSavedMessages
					? "Chat deleted, saved messages kept"
					: "Chat deleted",
			);
			chatActionStoreActions.setIsDeleteModalOpen(false);
			chatActionStoreActions.setSelectedChat(null);

			if (isCurrentChatOpened) {
				clearChat();
				navigate({ to: "/" });
			}
		},
		onError: () => {
			toast.error("Chat was not deleted", {
				description: "Please try again later",
			});
			chatActionStoreActions.setSelectedChat(null);
		},
	});

	const hasSavedMessages = (savedMessageCount ?? 0) > 0;

	return (
		<AlertDialog
			onOpenChange={(open) => chatActionStoreActions.setIsDeleteModalOpen(open)}
			open={isDeleteModalOpen}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete chat</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete the chat "{selectedChat?.title}"?
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{hasSavedMessages && (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
						<div className="flex items-start gap-2 text-sm">
							<BookmarkSimpleIcon className="mt-0.5 size-4 shrink-0" />
							<div className="space-y-1">
								<p>
									This chat has {savedMessageCount} saved{" "}
									{savedMessageCount === 1 ? "message" : "messages"}. Deleting
									the chat will delete{" "}
									<span className="font-medium">them too</span>.
								</p>
								<label
									className="flex cursor-pointer items-center gap-2 pt-1"
									onClick={(event) => {
										// SAFETY: click targets inside this dialog are DOM
										// elements; we only probe for the checkbox.
										const target = event.target as HTMLElement;
										// The checkbox toggles itself; avoid double-toggling
										// when the click lands on it.
										if (target.closest('[data-slot="checkbox"]')) {
											return;
										}
										setKeepSavedMessages((prev) => !prev);
									}}
								>
									<Checkbox
										checked={keepSavedMessages}
										onCheckedChange={(checked) =>
											setKeepSavedMessages(Boolean(checked))
										}
										className="border-foreground/30 bg-background"
									/>
									<span>Keep saved messages</span>
								</label>
							</div>
						</div>
					</div>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={deleteChatMutation.isPending}
						onClick={() => {
							if (!selectedChat) {
								toast.error("No chat selected to delete.");
								return;
							}
							deleteChatMutation.mutate({
								chatId: selectedChat._id,
								keepSavedMessages,
							});
						}}
					>
						{deleteChatMutation.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
