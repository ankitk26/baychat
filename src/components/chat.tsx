import { useChat } from "@ai-sdk/react";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { FileUIPart } from "ai";
import { useEffect, useRef, useState } from "react";
import { isImageGenerationModel } from "~/lib/is-image-generation-model";
import { cn } from "~/lib/utils";
import { useSharedChatContext } from "~/providers/chat-provider";
import { useModelStore } from "~/stores/model-store";
import type {
	ChatRegenerateFunction,
	ChatSendMessageFunction,
	CustomUIMessage,
} from "~/types";
import AiResponseAlert from "./ai-response-error";
import AssistantMessageSkeleton from "./assistant-message-skeleton";
import ChatMessages from "./chat-messages";
import EmptyChatContent from "./empty-chat-content";
import ImageGenerationSkeleton from "./image-generation-skeleton";
import ThinkingIndicator from "./thinking-indicator";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import UserMessageSkeleton from "./user-message-skeleton";
import UserPromptInput from "./user-prompt-input";

type Props = {
	chatId: string;
	dbMessages: CustomUIMessage[];
	isMessagesPending?: boolean;
};

const isImageFilePart = (
	part: CustomUIMessage["parts"][number],
): part is FileUIPart =>
	part.type === "file" &&
	"mediaType" in part &&
	part.mediaType.startsWith("image/") &&
	"url" in part &&
	typeof part.url === "string";

export default function Chat({
	chatId,
	dbMessages,
	isMessagesPending = false,
}: Props) {
	const { chat } = useSharedChatContext();
	const selectedModel = useModelStore((store) => store.selectedModel);

	const {
		messages,
		status,
		stop,
		regenerate,
		sendMessage,
		error,
		setMessages,
	} = useChat<CustomUIMessage>({ chat, id: chatId });

	const viewportRef = useRef<HTMLDivElement>(null);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);
	const [isScrollActive, setIsScrollActive] = useState(false);
	const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [inputHeight, setInputHeight] = useState(120); // Default estimate
	const [wasStopped, setWasStopped] = useState(false);

	const handleStop = () => {
		setWasStopped(true);
		return stop();
	};

	const handleSendMessage: ChatSendMessageFunction = (
		...args: Parameters<ChatSendMessageFunction>
	) => {
		setWasStopped(false);
		return sendMessage(...args);
	};

	const handleRegenerate: ChatRegenerateFunction = (
		...args: Parameters<ChatRegenerateFunction>
	) => {
		setWasStopped(false);
		return regenerate(...args);
	};

	const checkScrollPosition = () => {
		const viewport = viewportRef.current;

		if (!viewport) {
			return;
		}

		const { scrollTop, scrollHeight, clientHeight } = viewport;
		const isScrollable = scrollHeight > clientHeight;
		const bottomThreshold = 100;
		const isNearBottom =
			scrollTop + clientHeight >= scrollHeight - bottomThreshold;

		setShowScrollToBottom(isScrollable && !isNearBottom);
		setIsScrollActive(true);

		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		scrollTimeoutRef.current = setTimeout(() => {
			setIsScrollActive(false);
		}, 2000);
	};

	const scrollToBottom = () => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		viewport.scrollTo({
			top: viewport.scrollHeight,
			behavior: "instant",
		});
	};

	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) {
			return;
		}

		viewport.addEventListener("scroll", checkScrollPosition);

		// Check initial scroll position
		checkScrollPosition();

		return () => {
			viewport.removeEventListener("scroll", checkScrollPosition);
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, [messages]);

	useEffect(() => {
		// Only sync dbMessages when we have actual data, not during initial load
		// This preserves optimistic messages during route transitions
		if (!isMessagesPending) {
			setMessages(dbMessages);
		}
	}, [setMessages, dbMessages, isMessagesPending]);

	const isGeneratingImage = isImageGenerationModel(selectedModel);
	const latestGeneratedImageUrl =
		[...messages]
			.reverse()
			.filter((message) => message.role === "assistant")
			.flatMap((message) => message.parts)
			.find(isImageFilePart)?.url ?? null;

	return (
		<div className="relative mx-auto flex h-full min-h-0 w-full flex-col">
			{/* Full height scroll area that extends behind the prompt */}
			<div className="absolute inset-0">
				{!isMessagesPending && messages.length === 0 && <EmptyChatContent />}

				{chatId && (
					<ScrollArea className="h-full w-full" viewportRef={viewportRef}>
						<div className="mx-auto min-h-full w-full max-w-full px-3 lg:max-w-3xl lg:px-4">
							<div
								className="pb-safe my-4 space-y-6 lg:my-8 lg:space-y-8"
								style={{ paddingBottom: `${inputHeight + 40}px` }}
							>
								{isMessagesPending && messages.length === 0 ? (
									<>
										<UserMessageSkeleton />
										<AssistantMessageSkeleton />
									</>
								) : (
									<>
										<ChatMessages
											chatId={chatId}
											isGeneratingImage={isGeneratingImage}
											latestGeneratedImageUrl={latestGeneratedImageUrl}
											messages={messages}
											regenerate={handleRegenerate}
											sendMessage={handleSendMessage}
											status={status}
											wasStopped={wasStopped}
										/>

										{status === "submitted" &&
											messages.length > 0 &&
											messages.at(-1)?.role === "user" &&
											!error && (
												<div className="px-3 lg:px-0">
													{isGeneratingImage ? (
														<ImageGenerationSkeleton />
													) : (
														<ThinkingIndicator />
													)}
												</div>
											)}

										{error && <AiResponseAlert error={error} />}
									</>
								)}
							</div>
						</div>
					</ScrollArea>
				)}
			</div>

			{/* Scroll to bottom button - centered at top of prompt */}
			{showScrollToBottom && (
				<div
					className={cn(
						"absolute left-1/2 z-50 -translate-x-1/2 transform transition-opacity duration-300 ease-in-out",
						isScrollActive ? "opacity-100" : "pointer-events-none opacity-0",
					)}
					style={{ bottom: `${inputHeight + 16}px` }}
				>
					<Button className="rounded-full" onClick={scrollToBottom} size="icon">
						<CaretDownIcon />
					</Button>
				</div>
			)}

			{/* Fixed prompt input with backdrop blur */}
			<div className="absolute right-0 bottom-0 left-0 z-10">
				<UserPromptInput
					chatId={chatId}
					latestGeneratedImageUrl={latestGeneratedImageUrl}
					sendMessage={handleSendMessage}
					status={status}
					stop={handleStop}
					onHeightChange={setInputHeight}
				/>
			</div>
		</div>
	);
}
