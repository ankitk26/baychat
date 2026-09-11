import { PushPinIcon } from "@phosphor-icons/react";
import { usePinnedModels } from "~/hooks/use-pinned-models";
import { getModelByOpenRouterId } from "~/lib/get-model-by-id";
import type {
	ModelWithAvailability,
	ProviderGroupWithAvailability,
} from "~/types";
import { DropdownMenuSeparatorWithText } from "./dropdown-menu-separator-with-text";
import ModelMenuItem from "./model-menu-item";
import {
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";

// Up to this many pins are listed inline at the top of the dropdown;
// beyond that they collapse into their own sub dropdown.
const INLINE_PINNED_MODEL_COUNT = 5;

type Props = {
	accessibleModels: ProviderGroupWithAvailability[];
	onSelect: (model: ModelWithAvailability) => void | Promise<void>;
};

export default function PinnedModelsSection({
	accessibleModels,
	onSelect,
}: Props) {
	const { pinnedIds } = usePinnedModels();

	if (pinnedIds.length === 0) {
		return null;
	}

	const accessibleModelById = new Map(
		accessibleModels.flatMap((provider) =>
			provider.models.map((model) => [model.openRouterModelId, model]),
		),
	);

	// Keep the user's pin order, and drop pins that no longer resolve to a
	// catalog model (e.g. removed from the catalog or not accessible).
	const pinnedModels = pinnedIds
		.map((modelId) => getModelByOpenRouterId(modelId))
		.filter(
			(model): model is NonNullable<typeof model> =>
				model !== undefined && accessibleModelById.has(model.openRouterModelId),
		)
		.map((model) => accessibleModelById.get(model.openRouterModelId))
		.filter((model): model is ModelWithAvailability => model !== undefined);

	if (pinnedModels.length === 0) {
		return null;
	}

	const modelRows = pinnedModels.map((model) => (
		<ModelMenuItem key={model.modelId} model={model} onSelect={onSelect} />
	));

	if (pinnedModels.length > INLINE_PINNED_MODEL_COUNT) {
		return (
			<>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="flex items-center gap-3 py-2.5 text-xs">
						<PushPinIcon className="size-4" />
						Pinned models
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent className="ml-2 w-max rounded-lg">
							{modelRows}
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparatorWithText>
					All models
				</DropdownMenuSeparatorWithText>
			</>
		);
	}

	return (
		<>
			{modelRows}
			<DropdownMenuSeparatorWithText>All models</DropdownMenuSeparatorWithText>
		</>
	);
}
