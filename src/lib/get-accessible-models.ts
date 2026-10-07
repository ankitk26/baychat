import { allModelProviders, trialModelIds } from "~/constants/model-providers";
import type {
	ApiKeyStatus,
	ModelWithAvailability,
	ProviderGroupWithAvailability,
} from "~/types";

export function getAccessibleModels(
	apiKeyStatus: ApiKeyStatus,
	useOpenRouter: boolean,
): ProviderGroupWithAvailability[] {
	const resultProviderGroups: ProviderGroupWithAvailability[] = [];

	const hasAnyProviderKey =
		apiKeyStatus.gemini ||
		apiKeyStatus.openai ||
		apiKeyStatus.anthropic ||
		apiKeyStatus.xai;
	const trialModelIdSet = new Set<string>(trialModelIds);

	for (const group of allModelProviders) {
		const modelsWithAvailability: ModelWithAvailability[] = [];

		for (const model of group.models) {
			let available = false;

			// Primary check: If useOpenRouter toggle is ON, all models are available.
			if (useOpenRouter) {
				available =
					apiKeyStatus.openrouter ||
					(!apiKeyStatus.openrouter &&
						trialModelIdSet.has(model.openRouterModelId));
			} else {
				// If useOpenRouter toggle is OFF, availability depends on individual provider keys or if the model is free.
				let hasSpecificProviderKey = false;
				switch (group.key) {
					case "openai":
						hasSpecificProviderKey = apiKeyStatus.openai;
						break;
					case "anthropic":
						hasSpecificProviderKey = apiKeyStatus.anthropic;
						break;
					case "google":
						hasSpecificProviderKey = apiKeyStatus.gemini;
						break;
					case "xai":
						hasSpecificProviderKey = apiKeyStatus.xai;
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
