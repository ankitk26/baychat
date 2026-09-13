import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
	ArrowLeftIcon,
	BookmarkSimpleIcon,
	ChatsCircleIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { ScrollArea } from "~/components/app-scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/app-tooltip";
import SavedMessageItem from "~/components/saved-message-item";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import UserMessageSkeleton from "~/components/user-message-skeleton";
import { useContentWidth } from "~/hooks/use-content-width";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/_auth/saved-messages/$chatId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { chatId } = Route.useParams();

	const { data: chat } = useQuery(convexQuery(api.chats.getChat, { chatId }));

	const { data: savedMessages, isPending } = useQuery(
		convexQuery(api.savedMessages.getSavedMessagesByChat, { chatId }),
	);

	const unsaveAllMutation = useMutation({
		mutationFn: useConvexMutation(api.savedMessages.unsaveAllByChat),
	});

	const handleUnsaveAll = () => {
		unsaveAllMutation.mutate(
			{ chatId },
			{
				onSuccess: () => toast.success("Removed all saved messages"),
			},
		);
	};

	const chatTitle =
		chat?.title ?? savedMessages?.[0]?.chatTitle ?? "Saved messages";
	const contentWidth = useContentWidth("max-w-3xl", "xl:max-w-6xl");

	return (
		<div className="flex h-svh max-h-svh w-full flex-col">
			<div className="min-h-0 flex-1 overflow-hidden">
				<ScrollArea className="h-full w-full">
					<div
						className={cn(
							"mx-auto w-full px-3 pt-14 transition-[max-width] duration-300 ease-in-out lg:px-0",
							contentWidth,
						)}
					>
						{/* Header, aligned with the message column like the chat UI */}
						<div className="flex items-center justify-between gap-4 pb-2">
							<div className="flex min-w-0 items-center gap-1">
								<Link to="/saved-messages">
									<Button size="icon" variant="ghost">
										<ArrowLeftIcon />
									</Button>
								</Link>
								<div className="min-w-0">
									<h1 className="truncate font-medium">{chatTitle}</h1>
								</div>
							</div>
							{!isPending && (savedMessages?.length ?? 0) > 0 && (
								<div className="flex items-center">
									{chat && (
										<Link to="/chat/$chatId" params={{ chatId }}>
											<Tooltip>
												<TooltipTrigger
													render={<Button size="icon" variant="ghost" />}
												>
													<ChatsCircleIcon />
												</TooltipTrigger>
												<TooltipContent>Open chat</TooltipContent>
											</Tooltip>
										</Link>
									)}
									<Tooltip>
										<TooltipTrigger
											render={
												<Button
													onClick={handleUnsaveAll}
													size="icon"
													variant="ghost"
												/>
											}
										>
											<TrashIcon />
										</TooltipTrigger>
										<TooltipContent>Remove all saved messages</TooltipContent>
									</Tooltip>
								</div>
							)}
						</div>

						<div className="my-4 space-y-6 pb-20 lg:my-8 lg:space-y-8">
							{isPending ? (
								<>
									<UserMessageSkeleton />
									<Skeleton className="h-32 w-full rounded-lg" />
								</>
							) : savedMessages?.length === 0 ? (
								<div className="rounded-xl border border-dashed py-16 text-center">
									<BookmarkSimpleIcon className="mx-auto mb-4 size-10 opacity-40" />
									<p className="font-medium">No saved messages</p>
									<p className="text-sm text-muted-foreground">
										Messages you bookmark in this chat will appear here
									</p>
								</div>
							) : (
								savedMessages?.map((savedMessage) => (
									<SavedMessageItem
										key={savedMessage._id}
										savedMessage={savedMessage}
									/>
								))
							)}
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
