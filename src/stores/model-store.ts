import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { defaultSelectedModel } from "~/constants/model-providers";
import { getModelByOpenRouterId } from "~/lib/get-model-by-id";
import { STORAGE_KEYS } from "~/lib/storage-keys";
import type { Model } from "~/types";

type ModelStoreState = {
	selectedModel: Model;
	isWebSearchEnabled: boolean;
	retryModel: string | null;
};

const STORAGE_KEY = STORAGE_KEYS.selectedModelId;

function getInitialSelectedModel(): Model {
	if (typeof window === "undefined") {
		return defaultSelectedModel;
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const model = getModelByOpenRouterId(JSON.parse(stored));
			if (model) return model;
		}
	} catch {
		// ignore parse errors
	}
	return defaultSelectedModel;
}

const modelStore = new Store<ModelStoreState>({
	selectedModel: getInitialSelectedModel(),
	isWebSearchEnabled: false,
	retryModel: null,
});

modelStore.subscribe(() => {
	if (typeof window !== "undefined") {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify(modelStore.state.selectedModel.openRouterModelId),
		);
	}
});

export const useModelStore = <T>(selector: (state: ModelStoreState) => T): T =>
	useSelector(modelStore, selector);

export const modelStoreActions = {
	setSelectedModel: (model: Model) => {
		modelStore.setState((prev) => ({ ...prev, selectedModel: model }));
	},
	toggleIsWebSearch: () => {
		modelStore.setState((prev) => ({
			...prev,
			isWebSearchEnabled: !prev.isWebSearchEnabled,
		}));
	},
	setRetryModel: (model: string | null) => {
		modelStore.setState((prev) => ({ ...prev, retryModel: model }));
	},
};
