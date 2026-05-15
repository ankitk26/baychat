import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import { useEffect } from "react";
import {
	getModelModalities,
	type InputModality,
} from "~/lib/fetch-model-modalities";

type ModelModalitiesStoreState = {
	modalities: Map<string, InputModality[]>;
	isLoaded: boolean;
};

const modelModalitiesStore = new Store<ModelModalitiesStoreState>({
	modalities: new Map(),
	isLoaded: false,
});

let initStarted = false;

function initModalities() {
	if (initStarted) return;
	initStarted = true;

	getModelModalities().then((modalities) => {
		modelModalitiesStore.setState(() => ({
			modalities,
			isLoaded: true,
		}));
	});
}

export function useModelModalities(openRouterModelId: string): InputModality[] {
	const modalities = useSelector(
		modelModalitiesStore,
		(state) => state.modalities,
	);

	useEffect(() => {
		initModalities();
	}, []);

	return modalities.get(openRouterModelId) ?? [];
}

export function useIsModalitiesLoaded(): boolean {
	const isLoaded = useSelector(modelModalitiesStore, (state) => state.isLoaded);

	useEffect(() => {
		initModalities();
	}, []);

	return isLoaded;
}
