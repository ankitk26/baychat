import { ImagesIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "~/components/ui/sidebar";

export default function AppSidebarGalleryButton() {
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
						<Link to="/gallery" className="flex w-full" onClick={handleClick}>
							<SidebarMenuButton className="flex w-full min-w-8 cursor-pointer items-center justify-center border border-sidebar-border bg-sidebar text-center hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
								<ImagesIcon className="size-4" />
								<span>View Gallery</span>
							</SidebarMenuButton>
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
