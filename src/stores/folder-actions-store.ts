import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import type { SidebarFolder } from "~/types";

type FolderActionState = {
	selectedFolder: SidebarFolder | null;
	isCreateModalOpen: boolean;
	isDeleteModalOpen: boolean;
	isRenameModalOpen: boolean;
};

const folderActionStore = new Store<FolderActionState>({
	selectedFolder: null,
	isCreateModalOpen: false,
	isDeleteModalOpen: false,
	isRenameModalOpen: false,
});

export const useFolderActionStore = <T>(
	selector: (state: FolderActionState) => T,
): T => useSelector(folderActionStore, selector);

export const folderActionStoreActions = {
	setSelectedFolder: (folder: SidebarFolder | null) => {
		folderActionStore.setState((prev) => ({ ...prev, selectedFolder: folder }));
	},
	setIsCreateModalOpen: (value: boolean) => {
		folderActionStore.setState((prev) => ({
			...prev,
			isCreateModalOpen: value,
		}));
	},
	setIsDeleteModalOpen: (value: boolean) => {
		folderActionStore.setState((prev) => ({
			...prev,
			isDeleteModalOpen: value,
		}));
	},
	setIsRenameModalOpen: (value: boolean) => {
		folderActionStore.setState((prev) => ({
			...prev,
			isRenameModalOpen: value,
		}));
	},
};
