import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { defaultSelectedModel } from "~/constants/model-providers";
import type { Model } from "~/types";

type ModelStoreState = {
	selectedModel: Model;
	isWebSearchEnabled: boolean;
	retryModel: string | null;
};

const modelStore = new Store<ModelStoreState>({
	selectedModel: defaultSelectedModel,
	isWebSearchEnabled: false,
	retryModel: null,
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
