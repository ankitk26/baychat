import { ExportIcon } from "@phosphor-icons/react";
import { chatActionStoreActions } from "~/stores/chat-actions-store";
import type { SidebarChatType } from "~/types";
import { DropdownMenuItem } from "./ui/dropdown-menu";

type Props = {
	chat: SidebarChatType;
};

export default function AppSidebarChatItemShare(props: Props) {
	return (
		<DropdownMenuItem
			className="py-2 text-xs"
			onClick={(e) => {
				e.stopPropagation();
				chatActionStoreActions.setSelectedChat(props.chat);
				chatActionStoreActions.setIsShareDialogOpen(true);
			}}
		>
			<ExportIcon />
			<span className="leading-0">Share</span>
		</DropdownMenuItem>
	);
}
