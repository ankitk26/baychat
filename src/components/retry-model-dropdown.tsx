import type { UseChatHelpers } from "@ai-sdk/react";
import { useConvexMutation } from "@convex-dev/react-query";
import { GlobeIcon, KeyIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { getAccessibleModels } from "~/lib/get-accessible-models";
import { getModelByOpenRouterId } from "~/lib/get-model-by-id";
import { useCustomizationStore } from "~/stores/customization-store";
import { modelStoreActions, useModelStore } from "~/stores/model-store";
import { usePersistedApiKeysStore } from "~/stores/persisted-api-keys-store";
import type { CustomUIMessage, Model } from "~/types";
import { DropdownMenuSeparatorWithText } from "./dropdown-menu-separator-with-text";
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
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
	message: CustomUIMessage;
	regenerate: UseChatHelpers<CustomUIMessage>["regenerate"];
	// For user messages, pass the next assistant message to get the model that generated its response
	nextMessage?: CustomUIMessage;
};

export default function RetryModelDropdown(props: Props) {
	const { message, regenerate } = props;
	const { chatId } = useParams({ strict: false });
	const selectedModel = useModelStore((store) => store.selectedModel);
	const isWebSearchEnabled = useModelStore((store) => store.isWebSearchEnabled);
	const persistedApiKeys = usePersistedApiKeysStore(
		(store) => store.persistedApiKeys,
	);
	const persistedUseOpenRouter = usePersistedApiKeysStore(
		(store) => store.persistedUseOpenRouter,
	);
	const customSystemPrompt = useCustomizationStore(
		(store) => store.customSystemPrompt,
	);

	const accessibleModels = getAccessibleModels(
		persistedApiKeys,
		persistedUseOpenRouter,
	);

	const deleteMessagesMutation = useMutation({
		mutationFn: useConvexMutation(api.messages.deleteMessagesByTimestamp),
	});

	const handleRetry = async (model: Model) => {
		if (!chatId) {
			return;
		}

		// Set the model selector to the model being used for retry
		modelStoreActions.setSelectedModel(model);

		// delete all messages after current message in current chat
		deleteMessagesMutation.mutate({
			currentMessageSourceId: message.id,
			chatId,
			deleteCurrentMessage: message.role === "assistant",
		});

		await regenerate({
			messageId: message.id,
			body: {
				model,
				isWebSearchEnabled,
				apiKeys: persistedApiKeys,
				useOpenRouter: persistedUseOpenRouter,
				chatId,
				customSystemPrompt,
			},
		});
	};

	const handleRetryUsingSameModel = async () => {
		let modelToUse: Model | undefined;

		if (message.role === "assistant") {
			const originalModelId = message.metadata?.modelId;
			if (originalModelId) {
				modelToUse = getModelByOpenRouterId(originalModelId);
			}
		} else if (message.role === "user") {
			const nextMessage = props.nextMessage;
			if (nextMessage?.role === "assistant") {
				const originalModelId = nextMessage.metadata?.modelId;
				if (originalModelId) {
					modelToUse = getModelByOpenRouterId(originalModelId);
				}
			}
		}

		// Fall back to currently selected model if original model not found
		await handleRetry(modelToUse ?? selectedModel);
	};

	if (!chatId) {
		return null;
	}

	return (
		<DropdownMenu>
			<Tooltip>
				<DropdownMenuTrigger
					render={
						<TooltipTrigger render={<Button size="icon" variant="ghost" />}>
							<ArrowClockwiseIcon />
						</TooltipTrigger>
					}
				/>
				<TooltipContent>Retry message</TooltipContent>
			</Tooltip>
			<DropdownMenuContent className="w-50">
				{/* Web Search switch */}
				<div className="flex items-center justify-between px-2 py-2.5">
					<label
						className="flex items-center gap-2"
						htmlFor="web-search-switch"
					>
						<GlobeIcon className="size-4" />
						<span className="text-xs">Web Search</span>
					</label>
					<Switch
						id="web-search-switch"
						checked={isWebSearchEnabled}
						onCheckedChange={modelStoreActions.toggleIsWebSearch}
					/>
				</div>

				<DropdownMenuItem
					className="flex items-center gap-3 py-2.5 text-xs"
					onClick={handleRetryUsingSameModel}
				>
					<ArrowClockwiseIcon className="size-4" />
					Retry same
				</DropdownMenuItem>

				<DropdownMenuSeparatorWithText>
					or switch model
				</DropdownMenuSeparatorWithText>

				{accessibleModels.map((provider) => (
					<DropdownMenuSub key={provider.key}>
						<DropdownMenuSubTrigger className="flex items-center gap-3 py-2.5 text-xs">
							<ModelProviderIcon provider={provider.key} />
							{provider.provider}
						</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="mx-2 w-50">
								{provider.models.map((model) => (
									<DropdownMenuItem
										className="py-2.5 text-xs"
										disabled={!model.isAvailable}
										key={model.modelId}
										onClick={async () => {
											await handleRetry(model);
										}}
									>
										<ModelProviderIcon provider={provider.key} />
										{model.name}
										{!model.isAvailable && (
											<KeyIcon className="ml-auto size-3" />
										)}
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
