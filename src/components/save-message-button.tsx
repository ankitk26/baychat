import { useConvexMutation, convexQuery } from "@convex-dev/react-query";
import { BookmarkSimpleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./app-tooltip";
import { Button } from "./ui/button";

type Props = {
	chatId: string;
	messageId: string;
};

export default function SaveMessageButton({ chatId, messageId }: Props) {
	const { data: isSaved, isPending } = useQuery(
		convexQuery(api.savedMessages.isMessageSaved, { messageId }),
	);

	const saveMutation = useMutation({
		mutationFn: useConvexMutation(api.savedMessages.saveMessage),
	});

	const unsaveMutation = useMutation({
		mutationFn: useConvexMutation(api.savedMessages.unsaveMessage),
	});

	const handleToggle = () => {
		if (isSaved) {
			unsaveMutation.mutate(
				{ messageId },
				{
					onSuccess: () => toast.success("Removed from saved messages"),
				},
			);
			return;
		}

		saveMutation.mutate(
			{ chatId, messageId },
			{
				onSuccess: () => toast.success("Message saved"),
			},
		);
	};

	if (isPending) {
		return null;
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						onClick={handleToggle}
						size="icon"
						variant="ghost"
						disabled={saveMutation.isPending || unsaveMutation.isPending}
					/>
				}
			>
				<BookmarkSimpleIcon weight={isSaved ? "fill" : "regular"} />
			</TooltipTrigger>
			<TooltipContent>
				{isSaved ? "Remove from saved" : "Save message"}
			</TooltipContent>
		</Tooltip>
	);
}
