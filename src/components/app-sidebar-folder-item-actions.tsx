import {
	PencilIcon,
	DotsThreeVerticalIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { folderActionStoreActions } from "~/stores/folder-actions-store";
import type { SidebarFolder } from "~/types";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
	folder: SidebarFolder;
};

export default function AppSidebarFolderItemActions({ folder }: Props) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						size="icon-xs"
						variant="ghost"
						className="h-full w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<DotsThreeVerticalIcon className="size-4 md:size-3" />
					</Button>
				}
			/>
			<DropdownMenuContent side="right" align="start">
				<DropdownMenuItem
					className="py-2 text-xs"
					onClick={(e) => {
						e.stopPropagation();
						folderActionStoreActions.setSelectedFolder(folder);
						folderActionStoreActions.setIsRenameModalOpen(true);
					}}
				>
					<PencilIcon className="size-4" />
					<span>Rename</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					className="py-2 text-xs"
					onClick={(e: React.MouseEvent) => {
						e.stopPropagation();
						folderActionStoreActions.setSelectedFolder(folder);
						folderActionStoreActions.setIsDeleteModalOpen(true);
					}}
				>
					<TrashIcon className="size-4" />
					<span>Delete</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
