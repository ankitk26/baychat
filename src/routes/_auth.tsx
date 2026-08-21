import {
	ArrowsInLineHorizontalIcon,
	ArrowsOutLineHorizontalIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "~/components/app-sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/app-tooltip";
import ChatTableOfContentsToggle from "~/components/chat-table-of-contents-toggle";
import { Button } from "~/components/ui/button";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "~/components/ui/sidebar";
import { authQueryOptions } from "~/queries/auth-query";
import { layoutStoreActions, useLayoutStore } from "~/stores/layout-store";

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
	const isExpanded = useLayoutStore((state) => state.isExpanded);

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between bg-background/50 px-4 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none">
			{!isAppSidebarOpen && (
				<SidebarTrigger className="pointer-events-auto h-8 w-8" />
			)}
			<div className="pointer-events-auto flex items-center gap-2 md:ml-auto">
				{!isMobile && (
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									aria-label={
										isExpanded ? "Collapse chat width" : "Expand chat width"
									}
									className="transition-opacity duration-200"
									onClick={layoutStoreActions.toggleExpanded}
									size="icon"
									variant="secondary"
								/>
							}
						>
							{isExpanded ? (
								<ArrowsInLineHorizontalIcon className="size-4" />
							) : (
								<ArrowsOutLineHorizontalIcon className="size-4" />
							)}
						</TooltipTrigger>
						<TooltipContent>
							{isExpanded ? "Collapse chat width" : "Expand chat width"}
						</TooltipContent>
					</Tooltip>
				)}
				<ChatTableOfContentsToggle />
			</div>
		</div>
	);
}

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="h-svh overflow-hidden">
				<FloatingSidebarTrigger />
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
