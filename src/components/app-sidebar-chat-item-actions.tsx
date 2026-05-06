import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { Suspense } from "react";
import type { SidebarChatType } from "~/types";
import AppSidebarChatItemArchive from "./app-sidebar-chat-item-archive";
import AppSidebarChatItemDelete from "./app-sidebar-chat-item-delete";
import AppSidebarChatItemFolder from "./app-sidebar-chat-item-folder";
import AppSidebarChatItemPin from "./app-sidebar-chat-item-pin";
import AppSidebarChatItemRename from "./app-sidebar-chat-item-rename";
import AppSidebarChatItemShare from "./app-sidebar-chat-item-share";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

type Props = {
	chat: SidebarChatType;
};

export default function AppSidebarChatItemActions(props: Props) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						size="icon-xs"
						variant="ghost"
						className="h-full w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<DotsThreeVerticalIcon className="size-4 md:size-3" />
					</Button>
				}
			/>
			<DropdownMenuContent className="w-50" side="right" align="start">
				<AppSidebarChatItemRename chat={props.chat} />
				<AppSidebarChatItemPin chat={props.chat} />
				<AppSidebarChatItemDelete chat={props.chat} />
				<AppSidebarChatItemArchive chat={props.chat} />
				<AppSidebarChatItemShare chat={props.chat} />
				<Suspense fallback={<Skeleton className="h-3 w-3/4" />}>
					<AppSidebarChatItemFolder chat={props.chat} />
				</Suspense>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
