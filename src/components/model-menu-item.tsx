import { KeyIcon } from "@phosphor-icons/react";
import { usePinnedModels } from "~/hooks/use-pinned-models";
import type { ModelWithAvailability } from "~/types";
import ModelInputIndicators from "./model-input-indicators";
import ModelPinButton from "./model-pin-button";
import ModelProviderIcon from "./model-provider-icon";
import { DropdownMenuItem } from "./ui/dropdown-menu";

// OpenRouter model id prefixes don't match our provider keys exactly
// (e.g. "x-ai" → "xai"), so map them for the provider icon.
const PROVIDER_KEY_BY_MODEL_PREFIX = {
	google: "google",
	openai: "openai",
	anthropic: "anthropic",
	"x-ai": "xai",
	deepseek: "deepseek",
	moonshotai: "moonshot",
	"z-ai": "zai",
	minimax: "minimax",
	xiaomi: "xiaomi",
} as const;

type Props = {
	model: ModelWithAvailability;
	onSelect: (model: ModelWithAvailability) => void | Promise<void>;
	showPin?: boolean;
};

export default function ModelMenuItem({ model, onSelect, showPin }: Props) {
	const { isPinned, togglePinned } = usePinnedModels();
	const modelPrefix = model.openRouterModelId.split("/")[0];
	const providerKey =
		Object.entries(PROVIDER_KEY_BY_MODEL_PREFIX).find(
			([prefix]) => prefix === modelPrefix,
		)?.[1] ?? "openrouter";

	return (
		<DropdownMenuItem
			className="relative py-2.5 text-xs whitespace-nowrap"
			disabled={!model.isAvailable}
			onClick={() => {
				onSelect(model);
			}}
		>
			<ModelProviderIcon provider={providerKey} />
			{model.name}
			<span className="ml-auto flex items-center gap-0.5 pr-8">
				<ModelInputIndicators openRouterModelId={model.openRouterModelId} />
				{!model.isAvailable && <KeyIcon className="size-3" />}
			</span>
			{showPin !== false && (
				<ModelPinButton
					isPinned={isPinned(model.openRouterModelId)}
					onToggle={() => togglePinned(model.openRouterModelId)}
				/>
			)}
		</DropdownMenuItem>
	);
}
