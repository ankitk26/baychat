export type ProviderApiKeyName =
	| "gemini"
	| "openai"
	| "anthropic"
	| "openrouter"
	| "xai";

export const createMaskedHint = (
	provider: ProviderApiKeyName,
	value: string,
) => {
	if (value.length < 4) return null;
	const suffix = value.slice(-4);

	switch (provider) {
		case "openrouter":
			return value.length > 15
				? `${value.slice(0, 12)}...${value.slice(-3)}`
				: `...${suffix}`;
		case "xai":
			return `xai...${suffix}`;
		case "gemini":
			return suffix;
		case "openai":
		case "anthropic":
			return `sk-...${suffix}`;
	}
};
