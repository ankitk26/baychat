type ImageModelIdentifier = {
	name?: string;
	modelId?: string;
	openRouterModelId?: string;
};

const IMAGE_GENERATION_OPENROUTER_MODEL_IDS = new Set([
	// Google Nano Banana models
	"google/gemini-2.5-flash-image",
	"google/gemini-3-pro-image-preview",
	"google/gemini-3.1-flash-image-preview",
]);

export function isImageGenerationModel(model?: ImageModelIdentifier | null) {
	if (!model) {
		return false;
	}

	if (model.openRouterModelId) {
		return IMAGE_GENERATION_OPENROUTER_MODEL_IDS.has(model.openRouterModelId);
	}

	return false;
}
