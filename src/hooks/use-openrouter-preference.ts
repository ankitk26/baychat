import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useEffect } from "react";
import {
	apiKeyPreferencesStoreActions,
	useApiKeyPreferencesStore,
} from "~/stores/persisted-api-keys-store";

export function useOpenRouterPreference() {
	const localPreference = useApiKeyPreferencesStore(
		(state) => state.persistedUseOpenRouter,
	);
	const { data, isLoading } = useQuery({
		...convexQuery(api.userSettings.getUseOpenRouter, {}),
	});
	const hasProfilePreference = data !== undefined && data !== null;

	useEffect(() => {
		if (hasProfilePreference) {
			apiKeyPreferencesStoreActions.clearLocalPreference();
		}
	}, [hasProfilePreference]);

	return {
		value: data ?? localPreference,
		hasProfilePreference,
		isLoading,
	};
}
