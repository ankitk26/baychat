import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { STORAGE_KEYS } from "~/lib/storage-keys";

type LayoutStoreState = {
	isExpanded: boolean;
};

const STORAGE_KEY = STORAGE_KEYS.layout;

const getInitialState = (): LayoutStoreState => {
	if (typeof window === "undefined") {
		return { isExpanded: false };
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (
				parsed &&
				typeof parsed === "object" &&
				typeof parsed.isExpanded === "boolean"
			) {
				return parsed as LayoutStoreState;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return { isExpanded: false };
};

const layoutStore = new Store<LayoutStoreState>(getInitialState());

layoutStore.subscribe(() => {
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutStore.state));
		} catch {
			// Storage unavailable
		}
	}
});

export const useLayoutStore = <T>(
	selector: (state: LayoutStoreState) => T,
): T => useSelector(layoutStore, selector);

export const layoutStoreActions = {
	toggleExpanded: () => {
		layoutStore.setState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
	},
};
