import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { FolderOpenIcon } from "@phosphor-icons/react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { toast } from "sonner";
import type { SidebarChatType } from "~/types";
import {
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";

type Props = {
	chat: SidebarChatType;
};

export default function AppSidebarChatItemFolder(props: Props) {
	const { data: folders } = useSuspenseQuery(
		convexQuery(api.folders.getFolders, {}),
	);

	const updateChatFolderMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.updateChatFolder),
		onError: () => {
			toast.error("Could not update chat folder", {
				description: "Please try again later",
			});
		},
	});

	const handleFolderChange = (folderId: Id<"folders"> | undefined) => {
		updateChatFolderMutation.mutate({
			chatId: props.chat._id,
			folderId,
		});
	};

	if (folders.length === 0) {
		return null;
	}

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger className="py-2 text-xs">
				<FolderOpenIcon />
				Move to folder
			</DropdownMenuSubTrigger>

			<DropdownMenuPortal>
				<DropdownMenuSubContent className="ml-2">
					{/* dropdown item to move it to no folder */}
					{props.chat.folderId && (
						<DropdownMenuItem
							className="py-2 text-xs"
							key={`null_folder_${props.chat._id}`}
							onClick={() => handleFolderChange(undefined)}
						>
							No folder
						</DropdownMenuItem>
					)}
					{folders
						.filter((folder) => folder._id !== props.chat.folderId)
						.map((folder) => (
							<DropdownMenuItem
								className="py-2 text-xs"
								key={folder._id}
								onClick={() => handleFolderChange(folder._id)}
							>
								{folder.title}
							</DropdownMenuItem>
						))}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	);
}
