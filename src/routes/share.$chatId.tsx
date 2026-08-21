import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { AppSidebar } from "~/components/app-sidebar";
import ReadOnlyChatMessages from "~/components/read-only-chat-messages";
import { ThemeToggler } from "~/components/theme-toggle";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { authQueryOptions } from "~/queries/auth-query";

export const Route = createFileRoute("/share/$chatId")({
	beforeLoad: async ({ context }) => {
		const auth = await context.queryClient.fetchQuery(authQueryOptions);
		return { auth };
	},
	loader: ({ context, params }) => {
		context.queryClient.ensureQueryData(
			convexQuery(api.messages.getSharedChatMessages, {
				sharedChatUuid: params.chatId,
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { auth } = Route.useRouteContext();

	if (auth) {
		return (
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<ReadOnlyChatMessages />
				</SidebarInset>
			</SidebarProvider>
		);
	}

	return (
		<>
			<div className="mx-auto flex w-1/2 items-center justify-center">
				<ThemeToggler />
			</div>
			<ReadOnlyChatMessages />
		</>
	);
}
