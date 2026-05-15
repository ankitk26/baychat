/**
 * Fetches model input modalities from models.dev API.
 * Scans all providers (not just openrouter) and merges modalities per model ID
 * so all models are covered even if they only appear under non-openrouter providers.
 * Results are cached in a module-level variable for the lifetime of the app.
 */

export type InputModality = "text" | "image" | "pdf";

type ModelsDevModel = {
	id: string;
	name: string;
	modalities?: {
		input?: string[];
		output?: string[];
	};
};

type ModelsDevProvider = {
	name: string;
	models?: Record<string, ModelsDevModel>;
};

type ModelsDevApi = Record<string, ModelsDevProvider>;

let cachedModalities: Map<string, InputModality[]> | null = null;
let fetchPromise: Promise<Map<string, InputModality[]>> | null = null;

/**
 * Fetches model modalities from models.dev and returns a Map of openRouterModelId → input modalities.
 * Results are cached in memory after the first successful fetch.
 */
export async function getModelModalities(): Promise<
	Map<string, InputModality[]>
> {
	if (cachedModalities) {
		return cachedModalities;
	}

	// Deduplicate concurrent calls
	if (fetchPromise) {
		return fetchPromise;
	}

	fetchPromise = (async () => {
		try {
			const response = await fetch("https://models.dev/api.json");
			if (!response.ok) {
				throw new Error(
					`models.dev API returned ${response.status}: ${response.statusText}`,
				);
			}

			const data: ModelsDevApi = await response.json();

			const map = new Map<string, InputModality[]>();

			// Scan ALL providers and merge modalities per model ID
			for (const provider of Object.values(data)) {
				if (!provider.models) continue;
				for (const model of Object.values(provider.models)) {
					const raw = (model.modalities?.input as string[]) ?? [];
					if (raw.length === 0) continue;

					// Filter to only the modalities we care about
					const filtered = raw.filter(
						(m): m is InputModality =>
							m === "text" || m === "image" || m === "pdf",
					);

					const existing = map.get(model.id) ?? [];
					const merged = [...new Set([...existing, ...filtered])];
					map.set(model.id, merged);
				}
			}

			cachedModalities = map;
			return map;
		} catch (error) {
			console.error("Failed to fetch model modalities from models.dev:", error);
			cachedModalities = new Map();
			return cachedModalities;
		} finally {
			fetchPromise = null;
		}
	})();

	return fetchPromise;
}

/**
 * Returns the input modalities for a given OpenRouter model ID.
 * Returns an empty array if the model is not found or data hasn't been fetched yet.
 */
export function getInputModalitiesForModel(
	modalities: Map<string, InputModality[]>,
	openRouterModelId: string,
): InputModality[] {
	return modalities.get(openRouterModelId) ?? [];
}
