import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

type CustomizationStoreState = {
	customSystemPrompt: string;
};

const STORAGE_KEY = "baychat-customization-settings";

const getInitialState = (): CustomizationStoreState => {
	if (typeof window === "undefined") {
		return { customSystemPrompt: "" };
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (
				parsed &&
				typeof parsed === "object" &&
				typeof parsed.customSystemPrompt === "string"
			) {
				return parsed as CustomizationStoreState;
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
	if (typeof window !== "undefined") {
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
