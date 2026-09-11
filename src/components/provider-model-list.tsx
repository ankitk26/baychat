import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { ModelWithAvailability } from "~/types";
import ModelMenuItem from "./model-menu-item";
import { DropdownMenuItem } from "./ui/dropdown-menu";

const LATEST_MODEL_COUNT = 5;

// Don't bother with an expander when "show more" would only reveal a
// couple of extra models — just show them all.
const MIN_HIDDEN_MODELS_FOR_EXPANDER = 4;

type Props = {
	models: ModelWithAvailability[];
	onSelect: (model: ModelWithAvailability) => void | Promise<void>;
};

export default function ProviderModelList({ models, onSelect }: Props) {
	const [showAll, setShowAll] = useState(false);

	// Sort by release date, descending (latest first).
	const descendingModels = [...models].sort((a, b) =>
		b.releasedAt.localeCompare(a.releasedAt),
	);
	const isExpandable =
		descendingModels.length - LATEST_MODEL_COUNT >=
		MIN_HIDDEN_MODELS_FOR_EXPANDER;
	const visibleModels = showAll
		? descendingModels
		: descendingModels.slice(0, LATEST_MODEL_COUNT);

	return (
		<>
			{visibleModels.map((model) => (
				<ModelMenuItem key={model.modelId} model={model} onSelect={onSelect} />
			))}
			{isExpandable && (
				<DropdownMenuItem
					className="py-2.5 text-xs text-muted-foreground"
					closeOnClick={false}
					onClick={() => {
						setShowAll((prev) => !prev);
					}}
				>
					{showAll ? (
						<MinusIcon className="size-3.5" />
					) : (
						<PlusIcon className="size-3.5" />
					)}
					{showAll ? "Show less" : "Show more"}
				</DropdownMenuItem>
			)}
		</>
	);
}
