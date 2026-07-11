import { useConvexMutation } from "@convex-dev/react-query";
import { PushPinIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import type { SidebarChatType } from "~/types";
import { DropdownMenuItem } from "./ui/dropdown-menu";

type Props = {
	chat: SidebarChatType;
};

export default function AppSidebarChatItemPin(props: Props) {
	const toggleChatPinMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.toggleChatPin),
		onSuccess: (wasPinned) => {
			toast.success(wasPinned ? "Chat unpinned" : "Chat pinned");
		},
		onError: () => {
			toast.error("Could not pin chat", {
				description: "Please try again later",
			});
		},
	});

	return (
		<DropdownMenuItem
			className="py-2 text-xs"
			onClick={(e) => {
				e.stopPropagation();
				toggleChatPinMutation.mutate({
					chatId: props.chat._id,
				});
			}}
		>
			<PushPinIcon />
			<span className="leading-0">{props.chat.isPinned ? "Unpin" : "Pin"}</span>
		</DropdownMenuItem>
	);
}
