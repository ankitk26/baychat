import { BookmarkSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "~/components/ui/sidebar";

export default function AppSidebarSavedMessagesButton() {
	const { isMobile, setOpenMobile } = useSidebar();

	const handleClick = () => {
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<SidebarGroup className="py-1">
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<Link
							to="/saved-messages"
							className="flex w-full"
							onClick={handleClick}
						>
							{({ isActive }) => (
								<SidebarMenuButton
									className="flex w-full min-w-8 cursor-pointer items-center justify-center border border-sidebar-border bg-sidebar text-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-sidebar-accent-foreground"
									isActive={isActive}
								>
									<BookmarkSimpleIcon className="size-4" />
									<span>Saved messages</span>
								</SidebarMenuButton>
							)}
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
