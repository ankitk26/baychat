import { useParams } from "@tanstack/react-router";
import { useState } from "react";
import type { SidebarFolder } from "~/types";
import AppSidebarChatItem from "./app-sidebar-chat-item";
import AppSidebarFolderItemActions from "./app-sidebar-folder-item-actions";
import AppSidebarFolderItemToggler from "./app-sidebar-folder-item-toggler";
import {
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	useSidebar,
} from "./ui/sidebar";

type Props = {
	folder: SidebarFolder;
};

export default function AppSidebarFolderItem(props: Props) {
	const { chatId } = useParams({ strict: false });
	const [manualExpand, setManualExpand] = useState(false);
	const [collapsedAtChatId, setCollapsedAtChatId] = useState<string | null>(
		null,
	);
	const { isMobile } = useSidebar();

	const isActiveChatInFolder =
		chatId != null && props.folder.chats.some((chat) => chat.uuid === chatId);

	// User collapsed while viewing this chat — but if chatId changed since,
	// ignore the collapse so the new folder auto-expands.
	const userCollapsed = collapsedAtChatId === chatId;
	const showChats = isActiveChatInFolder ? !userCollapsed : manualExpand;

	console.log("[folder-item]", {
		folder: props.folder.title,
		chatId,
		chatUuids: props.folder.chats.map((c) => c.uuid),
		isActiveChatInFolder,
		userCollapsed,
		manualExpand,
		showChats,
	});

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		if (showChats && isActiveChatInFolder) {
			setCollapsedAtChatId(chatId ?? null);
		} else if (showChats) {
			setManualExpand(false);
		} else {
			setManualExpand(true);
			setCollapsedAtChatId(null);
		}
	};

	return (
		<>
			<SidebarMenuItem className="relative">
				<SidebarMenuButton
					onClick={handleClick}
					tooltip={props.folder.title}
					className="w-full"
				>
					<AppSidebarFolderItemToggler
						folderHasChats={props.folder.chats.length > 0}
						showChats={showChats}
					/>
					<span className="line-clamp-1 flex-1" title={props.folder.title}>
						{props.folder.title}
					</span>
				</SidebarMenuButton>
				<div
					data-sidebar="menu-action"
					className={
						isMobile
							? "absolute top-1/2 right-1 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center"
							: "absolute top-1/2 right-1 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center opacity-0 transition-opacity group-hover/menu-item:opacity-100"
					}
				>
					<AppSidebarFolderItemActions folder={props.folder} />
				</div>
			</SidebarMenuItem>

			{/* Chats under the folder */}
			{props.folder.chats.length > 0 && showChats && (
				<SidebarMenuSub className="mr-0 border-r-0 pr-0">
					{props.folder.chats.map((chat) => (
						<AppSidebarChatItem chat={chat} key={chat._id} />
					))}
				</SidebarMenuSub>
			)}
		</>
	);
}
