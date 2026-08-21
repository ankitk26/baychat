import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { z } from "zod";
import { isBrowser } from "~/lib/environment";
import { STORAGE_KEYS } from "~/lib/storage-keys";

const layoutStateSchema = z.object({ isExpanded: z.boolean() });

type LayoutStoreState = {
	isExpanded: boolean;
};

const STORAGE_KEY = STORAGE_KEYS.layout;

const getInitialState = (): LayoutStoreState => {
	if (!isBrowser()) {
		return { isExpanded: false };
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const result = layoutStateSchema.safeParse(JSON.parse(stored));
			if (result.success) {
				return result.data;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return { isExpanded: false };
};

const layoutStore = new Store<LayoutStoreState>(getInitialState());

layoutStore.subscribe(() => {
	if (isBrowser()) {
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
