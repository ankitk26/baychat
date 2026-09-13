import { useParams, useRouteContext } from "@tanstack/react-router";
import { useContentWidth } from "~/hooks/use-content-width";
import { cn } from "~/lib/utils";

export default function EmptyChatContent() {
	const { chatId } = useParams({ strict: false });
	const contentWidth = useContentWidth("max-w-3xl", "xl:max-w-6xl");

	if (chatId) {
		return null;
	}

	const { authUser } = useRouteContext({ from: "/_auth" });

	return (
		<div
			className={cn(
				"mx-auto flex h-full w-full flex-col justify-center px-4 transition-[max-width] duration-300 ease-in-out lg:px-0",
				contentWidth,
			)}
		>
			<h2 className="mb-2 text-2xl font-semibold lg:text-3xl">
				Welcome {authUser?.name?.split(" ")[0]}
			</h2>
			<p>Start a conversation by typing a message below.</p>
		</div>
	);
}
