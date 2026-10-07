import { defaultApiKeys, type ApiKeys, type Provider } from "~/types";

const providers: Provider[] = [
	"gemini",
	"openai",
	"anthropic",
	"openrouter",
	"xai",
];

export const getProviderApiKey = async (
	authId: string,
	provider: Provider,
): Promise<string | null> => {
	const siteUrl = process.env.VITE_CONVEX_SITE_URL;
	const serverSecret = process.env.BAYCHAT_INTERNAL_API_SECRET;
	if (!siteUrl || !serverSecret) {
		throw new Error("Provider API key service is not configured.");
	}

	const response = await fetch(
		`${siteUrl.replace(/\/$/, "")}/internal/provider-api-key`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${serverSecret}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ authId, provider }),
		},
	);

	if (!response.ok) {
		throw new Error("Unable to retrieve the provider API key.");
	}

	const result: { apiKey: string | null } = await response.json();
	return result.apiKey;
};

export const getProviderApiKeys = async (authId: string): Promise<ApiKeys> => {
	const entries = await Promise.all(
		providers.map(
			async (provider) =>
				[provider, (await getProviderApiKey(authId, provider)) ?? ""] as const,
		),
	);
	return { ...defaultApiKeys, ...Object.fromEntries(entries) };
};
