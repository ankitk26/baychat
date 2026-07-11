import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
} from "~/components/ui/sidebar";
import AppSidebarContent from "./app-sidebar-content";
import AppSidebarFooter from "./app-sidebar-footer";
import AppSidebarGalleryButton from "./app-sidebar-gallery-button";
import AppSidebarHeader from "./app-sidebar-header";
import AppSidebarNewChatButton from "./app-sidebar-new-chat-button";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<AppSidebarHeader />
				<AppSidebarNewChatButton />
				<AppSidebarGalleryButton />
			</SidebarHeader>

			<SidebarContent>
				<AppSidebarContent />
			</SidebarContent>

			<SidebarFooter>
				<AppSidebarFooter />
			</SidebarFooter>
		</Sidebar>
	);
}
