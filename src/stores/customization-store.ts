import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { z } from "zod";
import { isBrowser } from "~/lib/environment";
import { STORAGE_KEYS } from "~/lib/storage-keys";

const customizationStateSchema = z.object({
	customSystemPrompt: z.string(),
});

type CustomizationStoreState = {
	customSystemPrompt: string;
};

const STORAGE_KEY = STORAGE_KEYS.customization;

const getInitialState = (): CustomizationStoreState => {
	if (!isBrowser()) {
		return { customSystemPrompt: "" };
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const result = customizationStateSchema.safeParse(JSON.parse(stored));
			if (result.success) {
				return result.data;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return { customSystemPrompt: "" };
};

const customizationStore = new Store<CustomizationStoreState>(
	getInitialState(),
);

customizationStore.subscribe(() => {
	if (isBrowser()) {
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify(customizationStore.state),
			);
		} catch {
			// Storage unavailable (quota exceeded, private browsing, etc.)
		}
	}
});

export const useCustomizationStore = <T>(
	selector: (state: CustomizationStoreState) => T,
): T => useSelector(customizationStore, selector);

export const customizationStoreActions = {
	setCustomSystemPrompt: (prompt: string) => {
		customizationStore.setState((prev) => ({
			...prev,
			customSystemPrompt: prompt,
		}));
	},
};
