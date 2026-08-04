import { allModelProviders, trialModelIds } from "~/constants/model-providers";
import type {
	ApiKeys,
	ModelWithAvailability,
	ProviderGroupWithAvailability,
} from "~/types";

export function getAccessibleModels(
	apiKeys: ApiKeys,
	useOpenRouter: boolean,
): ProviderGroupWithAvailability[] {
	const resultProviderGroups: ProviderGroupWithAvailability[] = [];

	const hasAnyProviderKey = [
		apiKeys.gemini,
		apiKeys.openai,
		apiKeys.anthropic,
		apiKeys.xai,
	].some((key) => key.trim() !== "");
	const trialModelIdSet = new Set<string>(trialModelIds);

	for (const group of allModelProviders) {
		const modelsWithAvailability: ModelWithAvailability[] = [];

		for (const model of group.models) {
			let available = false;

			// Primary check: If useOpenRouter toggle is ON, all models are available.
			if (useOpenRouter) {
				available =
					apiKeys.openrouter.trim() !== "" ||
					(!apiKeys.openrouter.trim() &&
						trialModelIdSet.has(model.openRouterModelId));
			} else {
				// If useOpenRouter toggle is OFF, availability depends on individual provider keys or if the model is free.
				let hasSpecificProviderKey = false;
				switch (group.key) {
					case "openai":
						hasSpecificProviderKey = apiKeys.openai.trim() !== "";
						break;
					case "anthropic":
						hasSpecificProviderKey = apiKeys.anthropic.trim() !== "";
						break;
					case "google":
						hasSpecificProviderKey = apiKeys.gemini.trim() !== "";
						break;
					case "xai":
						hasSpecificProviderKey = apiKeys.xai.trim() !== "";
						break;
					default:
						hasSpecificProviderKey = false;
				}
				// A model is available if a specific provider key is present (for paid models) OR the model is free.
				available =
					hasSpecificProviderKey ||
					(!hasAnyProviderKey && trialModelIdSet.has(model.openRouterModelId));
			}

			modelsWithAvailability.push({
				...model,
				isAvailable: available,
			});
		}

		resultProviderGroups.push({
			...group,
			models: modelsWithAvailability,
		});
	}

	return resultProviderGroups;
}
