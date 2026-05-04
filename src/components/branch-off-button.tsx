import type { UseChatHelpers } from "@ai-sdk/react";
import { useConvexMutation } from "@convex-dev/react-query";
import {
	KeyIcon,
	ArrowClockwiseIcon,
	GitBranchIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { generateRandomUUID } from "~/lib/generate-random-uuid";
import { getAccessibleModels } from "~/lib/get-accessible-models";
import { useSharedChatContext } from "~/providers/chat-provider";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
	message: CustomUIMessage;
	sendMessage?: UseChatHelpers<CustomUIMessage>["sendMessage"];
};

export default function BranchOffButton({ message, sendMessage }: Props) {
	const { chatId } = useParams({ strict: false });
	const { clearChat } = useSharedChatContext();
	const navigate = useNavigate();

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

	const branchOffChatMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.branchOffChat),
	});
	const createMessageMutation = useMutation({
		mutationFn: useConvexMutation(api.messages.createMessage),
	});

	const handleBranchOff = (model: Model | null = null) => {
		if (!chatId) {
			return;
		}
		const branchChatUuid = generateRandomUUID();

		clearChat();
		navigate({ to: "/chat/$chatId", params: { chatId: branchChatUuid } });

		branchOffChatMutation.mutate({
			branchedChatUuid: branchChatUuid,
			lastMessage: {
				id: message.id,
				role: message.role,
			},
			parentChatUuid: chatId,
		});

		if (model) {
			modelStoreActions.setSelectedModel(model);
		}

		if (message.role === "user" && sendMessage) {
			const sourceMessageId = generateRandomUUID();

			createMessageMutation.mutate({
				messageBody: {
					chatId: branchChatUuid,
					role: "user",
					sourceMessageId,
					parts: JSON.stringify(message.parts),
				},
			});

			sendMessage(
				{
					role: "user",
					id: sourceMessageId,
					parts: message.parts,
				},
				{
					body: {
						model,
						isWebSearchEnabled,
						apiKeys: persistedApiKeys,
						useOpenRouter: persistedUseOpenRouter,
						chatId: branchChatUuid,
						customSystemPrompt,
					},
				},
			);
		}
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
							<GitBranchIcon />
						</TooltipTrigger>
					}
				/>
				<TooltipContent>Branch off</TooltipContent>
			</Tooltip>
			<DropdownMenuContent className="w-50">
				<DropdownMenuItem
					className="flex items-center gap-3 py-2.5 text-xs"
					onClick={() => handleBranchOff(selectedModel)}
				>
					<ArrowClockwiseIcon className="size-4" />
					Branch off
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
										onClick={() => handleBranchOff(model)}
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
