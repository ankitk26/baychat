export const STORAGE_PREFIX = "baychat" as const;

export const STORAGE_KEYS = {
	apiKeys: `${STORAGE_PREFIX}-api-keys`,
	appearance: `${STORAGE_PREFIX}-appearance-settings`,
	customization: `${STORAGE_PREFIX}-customization-settings`,
	selectedModelId: `${STORAGE_PREFIX}-selected-model-id`,
	layout: `${STORAGE_PREFIX}-layout-settings`,
} as const;
