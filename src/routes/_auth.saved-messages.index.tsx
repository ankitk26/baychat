import { convexQuery } from "@convex-dev/react-query";
import { BookmarkSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { ScrollArea } from "~/components/app-scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import { useContentWidth } from "~/hooks/use-content-width";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_auth/saved-messages/")({
	component: RouteComponent,
});

type SavedChatSummary = {
	chatId: string;
	title: string;
	count: number;
	lastSavedAt: number;
};

function SavedChatBlock({ summary }: { summary: SavedChatSummary }) {
	return (
		<Link
			to="/saved-messages/$chatId"
			params={{ chatId: summary.chatId }}
			className="group block rounded-xl border bg-popover px-5 py-4 transition-colors hover:bg-muted/40"
		>
			<div className="flex items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="truncate font-medium">{summary.title}</p>
					<p className="text-sm text-muted-foreground">
						{summary.count} saved {summary.count === 1 ? "message" : "messages"}
					</p>
				</div>
			</div>
		</Link>
	);
}

function RouteComponent() {
	const { data: savedChatSummaries, isPending } = useQuery(
		convexQuery(api.savedMessages.getSavedChatSummaries, {}),
	);
	const contentWidth = useContentWidth("max-w-3xl", "xl:max-w-6xl");

	return (
		<section className="h-svh max-h-svh py-4 pb-8 lg:py-6 lg:pb-12">
			<ScrollArea className="h-full w-full">
				<div
					className={cn(
						"mx-auto w-full space-y-6 px-8 pb-20 transition-[max-width] duration-300 ease-in-out lg:px-12 lg:pb-12",
						contentWidth,
					)}
				>
					<div className="space-y-1">
						<h1 className="flex items-center gap-2 text-xl font-semibold">
							<BookmarkSimpleIcon className="size-5" />
							Saved messages
						</h1>
						<p className="text-sm text-muted-foreground">
							Messages you saved from your chats, grouped by conversation
						</p>
					</div>

					{isPending ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} className="h-20 rounded-xl" />
							))}
						</div>
					) : savedChatSummaries?.length === 0 ? (
						<div className="rounded-xl border border-dashed py-16 text-center">
							<BookmarkSimpleIcon className="mx-auto mb-4 size-10 opacity-40" />
							<p className="font-medium">Nothing saved yet</p>
							<p className="text-sm text-muted-foreground">
								Bookmark any message in a chat to find it here
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{savedChatSummaries?.map((summary) => (
								<SavedChatBlock key={summary.chatId} summary={summary} />
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</section>
	);
}
