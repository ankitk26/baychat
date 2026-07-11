import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "~/components/app-sidebar";
import ChatTableOfContentsToggle from "~/components/chat-table-of-contents-toggle";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "~/components/ui/sidebar";
import { authQueryOptions } from "~/queries/auth-query";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context }) => {
		const authUser = await context.queryClient.fetchQuery(authQueryOptions);
		if (!authUser) {
			throw redirect({ to: "/login" });
		}
		return { authUser };
	},
	component: RouteComponent,
});

function FloatingSidebarTrigger() {
	const { isMobile, open, openMobile } = useSidebar();
	const isAppSidebarOpen = isMobile ? openMobile : open;

	return (
		<div className="pointer-events-none fixed inset-x-0 top-5 z-50 flex items-start justify-between px-4">
			{!isAppSidebarOpen && (
				<SidebarTrigger className="pointer-events-auto h-8 w-8" />
			)}
			<ChatTableOfContentsToggle />
		</div>
	);
}

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar variant="inset" />
			<SidebarInset className="h-svh overflow-hidden">
				<FloatingSidebarTrigger />
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
