import { Link } from "@tanstack/react-router";
import { useSharedChatContext } from "~/providers/chat-provider";
import { ThemeToggler } from "./theme-toggle";
import {
	SidebarMenu,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "./ui/sidebar";

export default function AppSidebarHeader() {
	const { clearChat } = useSharedChatContext();
	const { isMobile, setOpenMobile } = useSidebar();

	const handleClick = () => {
		clearChat();
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	return (
		<SidebarMenu className="py-1">
			<SidebarMenuItem className="flex items-center gap-1">
				<SidebarTrigger className="h-8 w-8" />
				<Link
					onClick={handleClick}
					to="/"
					className="flex flex-1 items-center justify-center text-base font-medium"
				>
					baychat
				</Link>
				<ThemeToggler />
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
