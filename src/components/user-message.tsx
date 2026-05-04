import type { UseChatHelpers } from "@ai-sdk/react";
import { useConvexMutation } from "@convex-dev/react-query";
import { CopyIcon, PencilIcon, PencilSlashIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { memo, useState } from "react";
import { toast } from "sonner";
import { buildUserMessageParts } from "~/lib/build-user-message-parts";
import { generateRandomUUID } from "~/lib/generate-random-uuid";
import { getFilePartsFromMessage } from "~/lib/get-file-parts-from-message";
import { getMessageContentFromParts } from "~/lib/get-message-content-from-parts";
import { cn } from "~/lib/utils";
import { useCustomizationStore } from "~/stores/customization-store";
import { useModelStore } from "~/stores/model-store";
import { usePersistedApiKeysStore } from "~/stores/persisted-api-keys-store";
import type { CustomUIMessage } from "~/types";
import BranchOffButton from "./branch-off-button";
import FileAttachmentsPreview from "./file-attachments-preview";
import RetryModelDropdown from "./retry-model-dropdown";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import UserMessageEditor from "./user-message-editor";

type Props = {
	chatId: string;
	latestGeneratedImageUrl?: string | null;
	message: CustomUIMessage;
	sendMessage: UseChatHelpers<CustomUIMessage>["sendMessage"];
	regenerate: UseChatHelpers<CustomUIMessage>["regenerate"];
	nextMessage?: CustomUIMessage;
};

export default memo(function UserMessage({
	chatId,
	latestGeneratedImageUrl,
	message,
	sendMessage,
	regenerate,
	nextMessage,
}: Props) {
	const messageContent = getMessageContentFromParts(message.parts);
	const messageAttachments = getFilePartsFromMessage(message.parts);

	const [isEditing, setIsEditing] = useState(false);

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

	const createMessageMutation = useMutation({
		mutationFn: useConvexMutation(api.messages.createMessage),
	});

	const deleteMessagesMutation = useMutation({
		mutationFn: useConvexMutation(api.messages.deleteMessagesByTimestamp),
	});

	const handleMessageEdit = (input: string) => {
		const sourceMessageId = generateRandomUUID();
		const userMessageParts = buildUserMessageParts({
			attachments: messageAttachments,
			latestGeneratedImageUrl,
			model: selectedModel,
			prompt: input,
		});

		deleteMessagesMutation.mutate({
			currentMessageSourceId: message.id,
			chatId,
			deleteCurrentMessage: true,
		});

		createMessageMutation.mutate({
			messageBody: {
				chatId,
				role: "user",
				sourceMessageId,
				parts: JSON.stringify(userMessageParts),
			},
		});

		sendMessage(
			{
				role: "user",
				id: sourceMessageId,
				parts: userMessageParts,
			},
			{
				body: {
					model: selectedModel,
					isWebSearchEnabled,
					apiKeys: persistedApiKeys,
					useOpenRouter: persistedUseOpenRouter,
					chatId,
					customSystemPrompt,
				},
			},
		);

		setIsEditing(false);
	};

	const handleEditCancel = () => {
		setIsEditing(false);
	};

	return (
		<div className="group flex w-full max-w-[90%] flex-col items-end space-y-3 self-end md:w-3/4">
			<div
				className={cn(
					"flex w-full max-w-full flex-col gap-6 rounded-lg border px-4 py-4 text-sm wrap-break-word whitespace-pre-wrap",
					isEditing ? "bg-secondary" : "bg-popover",
				)}
			>
				{isEditing ? (
					<UserMessageEditor
						initialValue={messageContent}
						onCancel={handleEditCancel}
						onSubmit={handleMessageEdit}
					/>
				) : (
					<>
						<FileAttachmentsPreview attachments={messageAttachments} />
						{messageContent.length > 0 && (
							<span className="whitespace-pre-wrap">{messageContent}</span>
						)}
					</>
				)}
			</div>
			<div className="flex opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								onClick={() => {
									setIsEditing((prev) => !prev);
								}}
								size="icon"
								variant="ghost"
							/>
						}
					>
						{isEditing ? <PencilSlashIcon /> : <PencilIcon />}
					</TooltipTrigger>
					<TooltipContent>Edit message</TooltipContent>
				</Tooltip>
				<BranchOffButton message={message} sendMessage={sendMessage} />
				<RetryModelDropdown
					message={message}
					regenerate={regenerate}
					nextMessage={nextMessage}
				/>
				<Tooltip>
					<TooltipTrigger
						render={
							<Button
								onClick={async () => {
									await navigator.clipboard.writeText(messageContent);
									toast.success("Copied to clipboard");
								}}
								size="icon"
								variant="ghost"
							/>
						}
					>
						<CopyIcon />
					</TooltipTrigger>
					<TooltipContent>Copy to clipboard</TooltipContent>
				</Tooltip>
			</div>
		</div>
	);
});
