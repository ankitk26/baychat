import { GitBranchIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useSharedChatContext } from "~/providers/chat-provider";
import type { SidebarChatType } from "~/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./app-tooltip";

type Props = {
	chat: SidebarChatType;
};

type NavigationEvent = {
	preventDefault: () => void;
	stopPropagation: () => void;
};

export default function BranchedChatIndicator(props: Props) {
	const { clearChat } = useSharedChatContext();
	const navigate = useNavigate();

	const handleNavigateToParent = (e: NavigationEvent) => {
		e.preventDefault();
		e.stopPropagation();
		clearChat();
		if (props.chat.parentChat?.uuid) {
			navigate({
				to: "/chat/$chatId",
				params: { chatId: props.chat.parentChat.uuid },
			});
		}
	};

	if (!props.chat.parentChat?.uuid) {
		return (
			<Tooltip>
				<TooltipTrigger
					render={
						<span>
							<GitBranchIcon className="size-4 shrink-0 text-sidebar-foreground/70" />
						</span>
					}
				/>
				<TooltipContent>Parent chat does not exist</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<span
						onClick={handleNavigateToParent}
						className="flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleNavigateToParent(e);
							}
						}}
					>
						<GitBranchIcon className="size-4 shrink-0" />
					</span>
				}
			/>
			<TooltipContent>
				Branched from {props.chat.parentChat.title}
			</TooltipContent>
		</Tooltip>
	);
}
