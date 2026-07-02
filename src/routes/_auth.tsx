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

	// On mobile, check openMobile state; on desktop, check open state
	const isAppSidebarOpen = isMobile ? openMobile : open;

	return (
		<div className="pointer-events-none relative z-20 flex h-14 w-full shrink-0 items-center justify-between px-4 md:absolute md:top-3 md:right-4 md:left-4 md:h-auto md:w-auto md:px-3 md:py-1.5">
			{!isAppSidebarOpen && (
				<SidebarTrigger className="pointer-events-auto h-10 w-10 md:h-8 md:w-8" />
			)}
			<ChatTableOfContentsToggle />
		</div>
	);
}

function RouteComponent() {
	return (
		<SidebarProvider>
			<div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,color-mix(in_oklch,var(--foreground)_6%,transparent),transparent_44rem)]" />
			<AppSidebar variant="sidebar" />
			<SidebarInset className="h-svh overflow-hidden rounded-none bg-background/92 shadow-none">
				<FloatingSidebarTrigger />
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
