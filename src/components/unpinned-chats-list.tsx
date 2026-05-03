import { convexQuery } from "@convex-dev/react-query";
import { ChatIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { groupChatsByDate } from "~/lib/group-chats-by-date";
import AppSidebarChatItem from "./app-sidebar-chat-item";
import DeleteAllChatsAlertDialog from "./delete-all-chats-alert-dialog";
import { SidebarGroup, SidebarMenu } from "./ui/sidebar";

export default function UnpinnedChatsList() {
	const { data: chats } = useSuspenseQuery(
		convexQuery(api.chats.getUnpinnedChats, {}),
	);

	const chatsGroupedByDateRanges = groupChatsByDate(chats);

	return (
		<SidebarGroup className="space-y-1 group-data-[collapsible=icon]:hidden">
			<div className="flex items-center justify-between px-2 py-1.5">
				<div className="flex items-center">
					<ChatIcon className="mr-2 size-4 text-sidebar-foreground/60" />
					<span className="text-xs font-normal text-sidebar-foreground/50">
						Chats
					</span>
				</div>
				{chats.length > 0 && <DeleteAllChatsAlertDialog />}
			</div>
			{chats.length === 0 && (
				<p className="px-2 py-2 text-xs text-sidebar-foreground/70">No chats</p>
			)}
			{chatsGroupedByDateRanges.map(({ group, chats: groupChats }) => (
				<div key={group}>
					<div className="px-2 pt-2 pb-0.5 text-[10px] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
						{group}
					</div>
					<SidebarMenu className="gap-0.5">
						{groupChats.map((chat) => (
							<AppSidebarChatItem chat={chat} key={chat._id} />
						))}
					</SidebarMenu>
				</div>
			))}
		</SidebarGroup>
	);
}
