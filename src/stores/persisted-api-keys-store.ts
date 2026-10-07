import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { isBrowser } from "~/lib/environment";
import { STORAGE_KEYS, STORAGE_PREFIX } from "~/lib/storage-keys";

type ApiKeyPreferencesState = {
	persistedUseOpenRouter: boolean;
};

const STORAGE_KEY = `${STORAGE_PREFIX}-api-key-preferences`;

const getInitialState = (): ApiKeyPreferencesState => {
	if (!isBrowser()) return { persistedUseOpenRouter: false };

	try {
		const storedPreferences = localStorage.getItem(STORAGE_KEY);
		if (storedPreferences) return JSON.parse(storedPreferences);

		// Read the old value only to retain the user's non-secret preference.
		const legacySettings = localStorage.getItem(STORAGE_KEYS.apiKeys);
		if (legacySettings) {
			const parsed = JSON.parse(legacySettings);
			return {
				persistedUseOpenRouter: parsed.persistedUseOpenRouter === true,
			};
		}
	} catch {
		// Ignore malformed local settings.
	}

	return { persistedUseOpenRouter: false };
};

const apiKeyPreferencesStore = new Store<ApiKeyPreferencesState>(
	getInitialState(),
);

apiKeyPreferencesStore.subscribe(() => {
	if (isBrowser()) {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(apiKeyPreferencesStore.state),
		);
	}
});

export const useApiKeyPreferencesStore = <T>(
	selector: (state: ApiKeyPreferencesState) => T,
): T => useSelector(apiKeyPreferencesStore, selector);

export const apiKeyPreferencesStoreActions = {
	setPersistedUseOpenRouter: (value: boolean) => {
		apiKeyPreferencesStore.setState(() => ({ persistedUseOpenRouter: value }));
	},
};
