import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

type TableOfContentsStoreState = {
	isOpen: boolean;
};

const tableOfContentsStore = new Store<TableOfContentsStoreState>({
	isOpen: false,
});

export const useTableOfContentsStore = <T>(
	selector: (state: TableOfContentsStoreState) => T,
): T => useSelector(tableOfContentsStore, selector);

export const tableOfContentsStoreActions = {
	open: () => {
		tableOfContentsStore.setState((prev) => ({ ...prev, isOpen: true }));
	},
	close: () => {
		tableOfContentsStore.setState((prev) => ({ ...prev, isOpen: false }));
	},
	toggle: () => {
		tableOfContentsStore.setState((prev) => ({
			...prev,
			isOpen: !prev.isOpen,
		}));
	},
};
