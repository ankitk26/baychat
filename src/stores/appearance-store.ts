import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { STORAGE_KEYS } from "~/lib/storage-keys";

type AppearanceStoreState = {
	showTokenUsage: boolean;
	wrapCodeBlocks: boolean;
};

const STORAGE_KEY = STORAGE_KEYS.appearance;

const getInitialState = (): AppearanceStoreState => {
	if (typeof window === "undefined") {
		return { showTokenUsage: false, wrapCodeBlocks: false };
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch {
		// Ignore parse errors
	}
	return { showTokenUsage: false, wrapCodeBlocks: false };
};

const appearanceStore = new Store<AppearanceStoreState>(getInitialState());

// Subscribe to changes and persist to localStorage
appearanceStore.subscribe(() => {
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(appearanceStore.state));
	}
});

export const useAppearanceStore = <T>(
	selector: (state: AppearanceStoreState) => T,
): T => useSelector(appearanceStore, selector);

export const appearanceStoreActions = {
	toggleShowTokenUsage: () => {
		appearanceStore.setState((prev) => ({
			...prev,
			showTokenUsage: !prev.showTokenUsage,
		}));
	},
	toggleWrapCodeBlocks: () => {
		appearanceStore.setState((prev) => ({
			...prev,
			wrapCodeBlocks: !prev.wrapCodeBlocks,
		}));
	},
};
