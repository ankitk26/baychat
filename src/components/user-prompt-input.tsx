import type { UseChatHelpers } from "@ai-sdk/react";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import type { ClipboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useIsDesktop } from "~/hooks/use-desktop";
import { usePromptAttachments } from "~/hooks/use-prompt-attachments";
import { buildUserMessageParts } from "~/lib/build-user-message-parts";
import { generateRandomUUID } from "~/lib/generate-random-uuid";
import { getChatTitle } from "~/server-fns/get-chat-title";
import { useCustomizationStore } from "~/stores/customization-store";
import { useModelStore } from "~/stores/model-store";
import { usePersistedApiKeysStore } from "~/stores/persisted-api-keys-store";
import type { CustomUIMessage } from "~/types";
import PromptActions from "./prompt-actions";
import PromptAttachmentsInput from "./prompt-attachments-input";

type Props = {
	chatId: string;
	latestGeneratedImageUrl?: string | null;
	status: ChatStatus;
	stop: UseChatHelpers<CustomUIMessage>["stop"];
	sendMessage: UseChatHelpers<CustomUIMessage>["sendMessage"];
	onHeightChange?: (height: number) => void;
};

export default function UserPromptInput(props: Props) {
	const { chatId: paramsChatId } = useParams({ strict: false });
	const { onHeightChange } = props;

	const [input, setInput] = useState("");
	const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);

	const navigate = useNavigate();
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isDesktop = useIsDesktop();
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
	const {
		attachments,
		clearAttachments,
		handleClipboardFiles,
		handleAttachmentChange,
		isUploading,
		removeAttachment,
		uploadAttachments,
	} = usePromptAttachments();

	const updateChatTitleMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.updateChatTitle),
	});
	const createMessageMutation = useMutation({
		mutationFn: useConvexMutation(api.messages.createMessage),
	});
	const createChatMutation = useMutation({
		mutationFn: useConvexMutation(api.chats.createChat),
	});

	const handleChatTitleUpdate = async (dbGeneratedChatId: Id<"chats">) => {
		if (input.trim().length === 0) {
			return;
		}

		const title = await getChatTitle({ data: { userMessage: input } });
		await updateChatTitleMutation.mutateAsync({
			chat: { chatId: dbGeneratedChatId, title: title as string },
		});
	};

	const handlePromptSubmit = async () => {
		if (
			isSubmittingPrompt ||
			(input.trim().length === 0 && attachments.length === 0)
		) {
			return;
		}

		setIsSubmittingPrompt(true);

		try {
			const sourceMessageId = generateRandomUUID();
			const messageText = input;
			const { optimisticAttachments, persistedAttachments } =
				await uploadAttachments();

			const optimisticUserMessageParts = buildUserMessageParts({
				attachments: optimisticAttachments,
				latestGeneratedImageUrl: props.latestGeneratedImageUrl,
				model: selectedModel,
				prompt: messageText,
			});
			const persistedUserMessageParts = buildUserMessageParts({
				attachments: persistedAttachments,
				latestGeneratedImageUrl: props.latestGeneratedImageUrl,
				model: selectedModel,
				prompt: messageText,
			});

			props.sendMessage(
				{
					role: "user",
					id: sourceMessageId,
					parts: optimisticUserMessageParts,
				},
				{
					body: {
						model: selectedModel,
						isWebSearchEnabled,
						apiKeys: persistedApiKeys,
						useOpenRouter: persistedUseOpenRouter,
						chatId: props.chatId,
						customSystemPrompt,
					},
				},
			);

			setInput("");
			clearAttachments();

			if (!paramsChatId) {
				navigate({
					to: "/chat/$chatId",
					params: { chatId: props.chatId },
				});
				const dbGeneratedChatId = await createChatMutation.mutateAsync({
					uuid: props.chatId,
				});
				handleChatTitleUpdate(dbGeneratedChatId);
			}

			createMessageMutation.mutate({
				messageBody: {
					chatId: props.chatId,
					role: "user",
					sourceMessageId,
					parts: JSON.stringify(persistedUserMessageParts),
				},
			});
		} catch (error) {
			console.error("Failed to submit prompt with attachments:", error);
		} finally {
			setIsSubmittingPrompt(false);
		}
	};

	const resizeTextarea = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
		const clipboardFiles = Array.from(event.clipboardData.items)
			.filter((item) => item.kind === "file" && item.type.startsWith("image/"))
			.map((item) => item.getAsFile())
			.filter((file): file is File => file !== null);

		if (clipboardFiles.length === 0) {
			return;
		}

		event.preventDefault();
		await handleClipboardFiles(clipboardFiles);
	};

	useEffect(() => {
		resizeTextarea();
	}, [input]);

	useEffect(() => {
		if (containerRef.current && onHeightChange) {
			const height = containerRef.current.getBoundingClientRect().height;
			onHeightChange(height);
		}
	}, [attachments.length, input, onHeightChange]);

	useEffect(() => {
		if (textareaRef.current && (isDesktop || !paramsChatId)) {
			textareaRef.current.focus();
		}
	}, [props.chatId, isDesktop, paramsChatId]);

	return (
		<div ref={containerRef} className="bg-background/80 backdrop-blur">
			<form
				className="mx-auto flex w-full max-w-full flex-col rounded-tl-lg rounded-tr-lg border border-border bg-popover/90 p-3 lg:max-w-3xl lg:p-4"
				onSubmit={(e) => {
					e.preventDefault();
					handlePromptSubmit();
				}}
			>
				<PromptAttachmentsInput
					attachments={attachments}
					fileInputRef={fileInputRef}
					onChange={handleAttachmentChange}
					onRemove={removeAttachment}
				/>

				<div className="flex-1">
					<textarea
						className="max-h-80 min-h-8 w-full resize-none text-sm focus:outline-none"
						disabled={
							isSubmittingPrompt ||
							isUploading ||
							createChatMutation.isPending ||
							createMessageMutation.isPending
						}
						onChange={(e) => {
							setInput(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handlePromptSubmit();
							}
						}}
						onPaste={(e) => {
							handlePaste(e);
						}}
						placeholder="Start the conversation..."
						ref={textareaRef}
						rows={1}
						value={input}
					/>
				</div>

				<PromptActions
					attachmentCount={attachments.length}
					disabled={
						isSubmittingPrompt ||
						isUploading ||
						createChatMutation.isPending ||
						createMessageMutation.isPending
					}
					isUploading={isUploading}
					onAttachClick={() => fileInputRef.current?.click()}
					status={props.status}
					stop={props.stop}
				/>
			</form>
		</div>
	);
}
