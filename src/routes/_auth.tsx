import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "~/components/app-sidebar";
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
	const isOpen = isMobile ? openMobile : open;

	if (isOpen) {
		return null;
	}

	return (
		<div className="relative z-20 flex h-14 w-full shrink-0 items-center px-3 md:absolute md:top-2 md:left-2 md:h-auto md:w-auto md:p-0">
			<SidebarTrigger className="h-10 w-10 md:h-8 md:w-8" />
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
