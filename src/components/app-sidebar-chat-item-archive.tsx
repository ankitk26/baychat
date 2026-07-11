import { useConvexMutation } from "@convex-dev/react-query";
import { ArchiveBoxIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import type { SidebarChatType } from "~/types";
import { DropdownMenuItem } from "./ui/dropdown-menu";

type Props = {
	chat: SidebarChatType;
};

export default function AppSidebarChatItemArchive(props: Props) {
	const toggleChatArchiveMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.toggleChatArchive),
		onSuccess: (wasArchived) => {
			toast.success(wasArchived ? "Chat unarchived" : "Chat archived");
		},
		onError: () => {
			toast.error("Could not archive chat", {
				description: "Please try again later",
			});
		},
	});

	return (
		<DropdownMenuItem
			className="py-2 text-xs"
			onClick={(e) => {
				e.stopPropagation();
				toggleChatArchiveMutation.mutate({
					chatId: props.chat._id,
				});
			}}
		>
			<ArchiveBoxIcon />
			<span className="leading-0">Archive</span>
		</DropdownMenuItem>
	);
}
