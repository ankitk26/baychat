import { Link, useParams } from "@tanstack/react-router";
import { useSharedChatContext } from "~/providers/chat-provider";
import type { SidebarChatType } from "~/types";
import AppSidebarChatItemActions from "./app-sidebar-chat-item-actions";
import BranchedChatIndicator from "./branched-chat-indicator";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";

type Props = {
	chat: SidebarChatType;
};

export default function AppSidebarChatItem({ chat }: Props) {
	const { chatId } = useParams({ strict: false });
	const { clearChat } = useSharedChatContext();
	const { isMobile, setOpenMobile } = useSidebar();
	const isActive = chatId === chat.uuid;

	const handleClick = () => {
		if (chatId === chat.uuid) {
			return;
		}
		clearChat();
		// Close mobile sidebar when navigating to a chat
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<SidebarMenuItem className="relative">
			<Link
				onClick={handleClick}
				params={{ chatId: chat.uuid }}
				to="/chat/$chatId"
				className="flex w-full"
			>
				<SidebarMenuButton
					isActive={isActive}
					tooltip={chat.title}
					className="w-full cursor-pointer"
				>
					{chat.isBranched && <BranchedChatIndicator chat={chat} />}
					<span className="line-clamp-1 flex-1" title={chat.title}>
						{chat.title}
					</span>
				</SidebarMenuButton>
			</Link>
			<div
				data-sidebar="menu-action"
				className={
					isMobile
						? "absolute top-1/2 right-1 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center"
						: "absolute top-1/2 right-1 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center opacity-0 transition-opacity group-hover/menu-item:opacity-100"
				}
			>
				<AppSidebarChatItemActions chat={chat} />
			</div>
		</SidebarMenuItem>
	);
}
