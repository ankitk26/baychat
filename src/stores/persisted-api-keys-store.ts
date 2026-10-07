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

		// Read the old setting only as a fallback until it syncs to the profile.
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

export const useApiKeyPreferencesStore = <T>(
	selector: (state: ApiKeyPreferencesState) => T,
): T => useSelector(apiKeyPreferencesStore, selector);

export const apiKeyPreferencesStoreActions = {
	setPersistedUseOpenRouter: (value: boolean) => {
		apiKeyPreferencesStore.setState(() => ({ persistedUseOpenRouter: value }));
	},
	preserveLocalPreference: (value: boolean) => {
		if (isBrowser()) {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ persistedUseOpenRouter: value }),
			);
		}
	},
	clearLocalPreference: () => {
		if (!isBrowser()) return;
		localStorage.removeItem(STORAGE_KEY);

		const legacySettings = localStorage.getItem(STORAGE_KEYS.apiKeys);
		if (!legacySettings) return;
		try {
			const parsed = JSON.parse(legacySettings);
			delete parsed.persistedUseOpenRouter;
			localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(parsed));
		} catch {
			// Leave malformed legacy settings to the key migration handler.
		}
	},
};
