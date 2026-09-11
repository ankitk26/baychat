import { convexQuery } from "@convex-dev/react-query";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { useCallback, useState } from "react";
import { getAccessibleModels } from "~/lib/get-accessible-models";
import { modelStoreActions, useModelStore } from "~/stores/model-store";
import { usePersistedApiKeysStore } from "~/stores/persisted-api-keys-store";
import ModelProviderIcon from "./model-provider-icon";
import PinnedModelsSection from "./pinned-models-section";
import ProviderModelList from "./provider-model-list";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function ModelSelector() {
	const [open, setOpen] = useState(false);
	const selectedModel = useModelStore((store) => store.selectedModel);

	const persistedApiKeys = usePersistedApiKeysStore(
		(store) => store.persistedApiKeys,
	);
	const persistedUseOpenRouter = usePersistedApiKeysStore(
		(store) => store.persistedUseOpenRouter,
	);
	const accessibleModels = getAccessibleModels(
		persistedApiKeys,
		persistedUseOpenRouter,
	);
	const hasOwnKey = persistedUseOpenRouter
		? persistedApiKeys.openrouter.trim() !== ""
		: [
				persistedApiKeys.gemini,
				persistedApiKeys.openai,
				persistedApiKeys.anthropic,
				persistedApiKeys.xai,
			].some((key) => key.trim() !== "");
	const { data: trialUsage } = useQuery({
		...convexQuery(api.trial.getUsage, {}),
		enabled: !hasOwnKey,
	});
	const handleHotkey = useCallback(() => setOpen(true), []);
	useHotkey("Mod+/", handleHotkey);

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{selectedModel.name}
				{!hasOwnKey && trialUsage && (
					<span className="ml-1 text-[11px] text-muted-foreground">
						{trialUsage.remaining} free left
					</span>
				)}
				<CaretDownIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-max min-w-60">
				<PinnedModelsSection
					accessibleModels={accessibleModels}
					onSelect={(model) => {
						modelStoreActions.setSelectedModel(model);
					}}
				/>
				{accessibleModels.map((provider) => (
					<DropdownMenuSub key={provider.key}>
						<DropdownMenuSubTrigger className="flex items-center gap-3 py-2.5 text-xs">
							<ModelProviderIcon provider={provider.key} />
							{provider.provider}
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="ml-2 w-max rounded-lg">
								<ProviderModelList
									models={provider.models}
									onSelect={(model) => {
										modelStoreActions.setSelectedModel(model);
									}}
								/>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
