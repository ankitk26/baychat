import { CaretDownIcon, KeyIcon } from "@phosphor-icons/react";
import { getAccessibleModels } from "~/lib/get-accessible-models";
import { modelStoreActions, useModelStore } from "~/stores/model-store";
import { usePersistedApiKeysStore } from "~/stores/persisted-api-keys-store";
import ModelInputIndicators from "./model-input-indicators";
import ModelProviderIcon from "./model-provider-icon";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function ModelSelector() {
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

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" />}>
				{selectedModel.name}
				<CaretDownIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60">
				{accessibleModels.map((provider) => (
					<DropdownMenuSub key={provider.key}>
						<DropdownMenuSubTrigger className="flex items-center gap-3 py-2.5 text-xs">
							<ModelProviderIcon provider={provider.key} />
							{provider.provider}
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="ml-2 w-60 rounded-lg">
								{provider.models.map((model) => (
									<DropdownMenuItem
										className="py-2.5 text-xs whitespace-nowrap"
										disabled={!model.isAvailable}
										key={model.modelId}
										onClick={() => {
											modelStoreActions.setSelectedModel(model);
										}}
									>
										<ModelProviderIcon provider={provider.key} />
										{model.name}
										<span className="ml-auto flex items-center gap-0.5">
											<ModelInputIndicators
												openRouterModelId={model.openRouterModelId}
											/>
											{!model.isAvailable && <KeyIcon className="size-3" />}
										</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
