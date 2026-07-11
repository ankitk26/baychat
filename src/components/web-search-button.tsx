import { GlobeIcon } from "@phosphor-icons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { cn } from "~/lib/utils";
import { modelStoreActions, useModelStore } from "~/stores/model-store";
import { usePersistedApiKeysStore } from "~/stores/persisted-api-keys-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "./app-tooltip";
import { Button } from "./ui/button";

export default function WebSearchButton() {
	useHotkey("Mod+Shift+S", modelStoreActions.toggleIsWebSearch);

	const isWebSearchEnabled = useModelStore((store) => store.isWebSearchEnabled);
	const selectedModel = useModelStore((store) => store.selectedModel);
	const persistedUseOpenRouter = usePersistedApiKeysStore(
		(store) => store.persistedUseOpenRouter,
	);

	if (
		!selectedModel.openRouterModelId.startsWith("google") &&
		!persistedUseOpenRouter
	) {
		return null;
	}

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						className={cn(
							"transition-all duration-300 ease-out",
							isWebSearchEnabled ? "border-primary" : "border-border",
						)}
						onClick={modelStoreActions.toggleIsWebSearch}
						type="button"
						variant={isWebSearchEnabled ? "default" : "outline"}
					>
						<GlobeIcon />
						<span className="hidden sm:inline">Search</span>
						<span className="sm:hidden">Web</span>
					</Button>
				}
			/>
			<TooltipContent>Ctrl+Shift+S</TooltipContent>
		</Tooltip>
	);
}
