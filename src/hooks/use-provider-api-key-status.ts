import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import type { ApiKeyStatus } from "~/types";

export function useProviderApiKeyStatus() {
	const { data } = useQuery({
		...convexQuery(api.providerApiKeys.listConfigured, {}),
	});
	const configuredProviders = new Map(
		(data ?? []).map(({ provider, maskedHint }) => [provider, maskedHint]),
	);
	const status: ApiKeyStatus = {
		gemini: configuredProviders.has("gemini"),
		openai: configuredProviders.has("openai"),
		anthropic: configuredProviders.has("anthropic"),
		openrouter: configuredProviders.has("openrouter"),
		xai: configuredProviders.has("xai"),
	};
	const maskedHints = {
		gemini: configuredProviders.get("gemini") ?? null,
		openai: configuredProviders.get("openai") ?? null,
		anthropic: configuredProviders.get("anthropic") ?? null,
		openrouter: configuredProviders.get("openrouter") ?? null,
		xai: configuredProviders.get("xai") ?? null,
	};

	return { status, maskedHints, isLoading: data === undefined };
}
