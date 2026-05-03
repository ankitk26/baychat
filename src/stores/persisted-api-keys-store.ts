import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { type ApiKeys, defaultApiKeys } from "~/types";

type ApiKeysStoreState = {
	persistedApiKeys: ApiKeys;
	persistedUseOpenRouter: boolean;
};

const STORAGE_KEY = "baychat-api-keys";

const getInitialState = (): ApiKeysStoreState => {
	if (typeof window === "undefined") {
		return {
			persistedApiKeys: defaultApiKeys,
			persistedUseOpenRouter: false,
		};
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch {
		// Ignore parse errors
	}
	return {
		persistedApiKeys: defaultApiKeys,
		persistedUseOpenRouter: false,
	};
};

const apiKeysStore = new Store<ApiKeysStoreState>(getInitialState());

// Subscribe to changes and persist to localStorage
apiKeysStore.subscribe(() => {
	if (typeof window !== "undefined") {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(apiKeysStore.state));
	}
});

export const usePersistedApiKeysStore = <T>(
	selector: (state: ApiKeysStoreState) => T,
): T => useSelector(apiKeysStore, selector);

export const persistedApiKeysStoreActions = {
	setPersistedApiKeys: (keys: ApiKeys) => {
		apiKeysStore.setState((prev) => ({ ...prev, persistedApiKeys: keys }));
	},
	setPersistedUseOpenRouter: (value: boolean) => {
		apiKeysStore.setState((prev) => ({
			...prev,
			persistedUseOpenRouter: value,
		}));
	},
};
