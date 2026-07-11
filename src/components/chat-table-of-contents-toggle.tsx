import { ListIcon } from "@phosphor-icons/react";
import { useLocation } from "@tanstack/react-router";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/app-tooltip";
import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/hooks/use-mobile";
import {
	tableOfContentsStoreActions,
	useTableOfContentsStore,
} from "~/stores/table-of-contents-store";

export default function ChatTableOfContentsToggle() {
	const location = useLocation();
	const isChatRoute = location.pathname.startsWith("/chat/");
	const isOpen = useTableOfContentsStore((state) => state.isOpen);
	const isMobile = useIsMobile();

	if (!isChatRoute || isOpen) {
		return null;
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						className="pointer-events-auto flex h-10 w-10 shrink-0 rounded-md transition-opacity duration-200 md:ml-auto md:h-8 md:w-8"
						onClick={tableOfContentsStoreActions.open}
						size="icon"
						variant={isMobile ? "ghost" : "secondary"}
					/>
				}
			>
				<ListIcon className="size-4" />
			</TooltipTrigger>
			<TooltipContent>Table of contents</TooltipContent>
		</Tooltip>
	);
}
