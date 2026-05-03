import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, smoothStream, streamText } from "ai";
import type { FileUIPart, UIMessagePart, UIDataTypes, UITools } from "ai";
import { api } from "convex/_generated/api";
import { defaultSelectedModel } from "~/constants/model-providers";
import { systemMessage } from "~/constants/system-message";
import { fetchAuthMutation } from "~/lib/auth-server";
import { generateRandomUUID } from "~/lib/generate-random-uuid";
import { createMessageServerFn } from "~/server-fns/create-message";
import { getAuthUser } from "~/server-fns/get-auth";
import type { ApiKeys, CustomUIMessage, Model } from "~/types";

const resolveModelForRequest = (
	requestModel: Model,
	apiKeys: ApiKeys,
	useOpenRouter: boolean,
	isWebSearchEnabled: boolean,
) => {
	const geminiProvider = createGoogleGenerativeAI({
		apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
	});
	const defaultModel = geminiProvider(defaultSelectedModel.modelId);

	if (useOpenRouter && apiKeys.openrouter.trim() !== "") {
		const openRouter = createOpenRouter({ apiKey: apiKeys.openrouter });
		if (isWebSearchEnabled) {
			return openRouter.chat(`${requestModel.openRouterModelId}:online`);
		}
		return openRouter.chat(requestModel.openRouterModelId);
	}

	if (!useOpenRouter) {
		if (requestModel.openRouterModelId.startsWith("google")) {
			if (apiKeys.gemini.trim() === "") {
				return defaultModel;
			}
			return createGoogleGenerativeAI({ apiKey: apiKeys.gemini })(
				requestModel.modelId,
			);
		}

		if (requestModel.openRouterModelId.startsWith("openai")) {
			if (apiKeys.openai.trim() === "") {
				throw new Error("API Key for OpenAI not provided.");
			}
			return createOpenAI({ apiKey: apiKeys.openai })(requestModel.modelId);
		}

		if (requestModel.openRouterModelId.startsWith("anthropic")) {
			if (apiKeys.anthropic.trim() === "") {
				throw new Error("API Key for Anthropic not provided.");
			}
			return createAnthropic({ apiKey: apiKeys.anthropic })(
				requestModel.modelId,
			);
		}

		if (requestModel.openRouterModelId.startsWith("x-ai")) {
			if (apiKeys.xai.trim() === "") {
				throw new Error("API Key for xAI not provided.");
			}
			return createXai({ apiKey: apiKeys.xai })(requestModel.modelId);
		}
	}

	return defaultModel;
};

const FAILED_UPLOAD_PLACEHOLDER =
	"https://placehold.co/600x400?text=Image+Upload+Failed";

const ALLOWED_TYPES = ["step-start", "file", "text", "reasoning"];

const extractBase64 = (dataUrl: string) => {
	const match = dataUrl.match(/base64,(.+)$/);
	return match ? match[1] : null;
};

const base64ToBytes = (base64: string) => {
	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

const uploadImage = async (part: FileUIPart) => {
	const base64 = extractBase64(part.url);
	if (!base64) return null;

	const bytes = base64ToBytes(base64);
	const uploadUrl = await fetchAuthMutation(api.messages.generateUploadUrl);

	const result = await fetch(uploadUrl, {
		method: "POST",
		headers: { "Content-Type": part.mediaType },
		body: bytes,
	});

	if (!result.ok) throw new Error(`Upload failed: ${result.status}`);

	const { storageId } = await result.json();
	// This stores ownership and returns the URL in one authenticated mutation.
	const imageUrl = await fetchAuthMutation(api.imageGenerations.create, {
		storageId,
	});

	return { storageId, imageUrl };
};

const isImagePart = (
	part: UIMessagePart<UIDataTypes, UITools>,
): part is FileUIPart =>
	part.type === "file" &&
	"mediaType" in part &&
	(part as FileUIPart).mediaType?.startsWith("image/");

const processReasoningParts = (
	parts: UIMessagePart<UIDataTypes, UITools>[],
) => {
	return parts.map((part) => {
		if (
			part.type === "reasoning" &&
			"text" in part &&
			typeof part.text === "string"
		) {
			const text = part.text;
			if (text.length > 1000) {
				return {
					type: "reasoning" as const,
					text: text.substring(0, 1000) + "...",
				};
			}
			return {
				type: "reasoning" as const,
				text,
			};
		}
		return part;
	});
};

const processMessageParts = async (
	allParts: UIMessagePart<UIDataTypes, UITools>[],
) => {
	const hasImages = allParts.some((part) => isImagePart(part));

	if (!hasImages) {
		return { partsToSave: allParts, success: true };
	}

	const filteredParts = allParts.filter((part) =>
		ALLOWED_TYPES.includes(part.type),
	);

	const parts = processReasoningParts(filteredParts);

	const processedParts = await Promise.all(
		parts.map(async (part) => {
			if (isImagePart(part)) {
				try {
					const uploadedImage = await uploadImage(part);
					if (!uploadedImage) {
						return null;
					}
					const { imageUrl } = uploadedImage;
					if (imageUrl) {
						return { ...part, url: imageUrl };
					}
				} catch (error) {
					console.error("Failed to upload image:", error);
					return { ...part, url: FAILED_UPLOAD_PLACEHOLDER };
				}
			}
			return part;
		}),
	);

	const partsToSave = processedParts.filter(
		(part): part is NonNullable<typeof part> => part !== null,
	);

	return { partsToSave };
};

const getTextAttachmentPromptPart = (part: FileUIPart) => {
	const textContent = part.providerMetadata?.baychat?.textContent;
	if (typeof textContent !== "string" || textContent.trim() === "") {
		return null;
	}

	return {
		type: "text" as const,
		text: `Attached file: ${part.filename ?? "untitled"}\n\n${textContent}`,
	};
};

const transformMessagesForModel = (
	messages: CustomUIMessage[],
): CustomUIMessage[] =>
	messages.map((message) => {
		if (message.role !== "user") {
			return message;
		}

		const transformedParts: CustomUIMessage["parts"] = [];

		for (const part of message.parts) {
			if (part.type !== "file") {
				transformedParts.push(part);
				continue;
			}

			const mediaType =
				typeof part.mediaType === "string" ? part.mediaType : "";
			// Treat malformed file parts as non-media instead of crashing.
			if (mediaType.startsWith("image/") || mediaType === "application/pdf") {
				transformedParts.push(part);
				continue;
			}

			const textPart = getTextAttachmentPromptPart(part);
			if (textPart) {
				transformedParts.push(textPart);
			}
		}

		return {
			...message,
			parts: transformedParts,
		};
	});

type ChatRequestBody = {
	messages: CustomUIMessage[];
	model: Model;
	isWebSearchEnabled: boolean;
	apiKeys: ApiKeys;
	useOpenRouter: boolean;
	chatId?: string;
};

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const authData = await getAuthUser();
				if (!authData) {
					throw new Error("Invalid request");
				}

				const chatRequestBody: ChatRequestBody = await request.json();
				const {
					messages,
					model: requestModel,
					isWebSearchEnabled,
					apiKeys,
					useOpenRouter,
					chatId,
				} = chatRequestBody;

				const modelToUse = resolveModelForRequest(
					requestModel,
					apiKeys,
					useOpenRouter,
					isWebSearchEnabled,
				);

				const result = streamText({
					model: modelToUse,
					system: systemMessage,
					messages: await convertToModelMessages(
						transformMessagesForModel(messages),
					),
					temperature: 0.7,
					experimental_transform: smoothStream({ chunking: "line" }),
					abortSignal: request.signal,
					...(isWebSearchEnabled &&
						requestModel.openRouterModelId.startsWith("google") && {
							tools: {
								google_search: google.tools.googleSearch({}) as any,
							},
						}),
				});

				return result.toUIMessageStreamResponse({
					originalMessages: messages,
					sendReasoning: true,
					generateMessageId: generateRandomUUID,
					messageMetadata: ({ part }) => {
						if (part.type === "start") {
							return {
								modelId: requestModel.openRouterModelId,
								modelName: requestModel.name,
								createdAt: Date.now(),
							};
						}
						if (part.type === "finish") {
							return { totalTokens: part.totalUsage.totalTokens };
						}
					},
					sendSources: isWebSearchEnabled,
					onFinish: async ({ responseMessage }) => {
						if (!chatId || responseMessage.parts.length === 0) return;

						// Process all parts (filter types, truncate reasoning, upload images)
						const { partsToSave } = await processMessageParts(
							responseMessage.parts,
						);

						// Save message to database
						await createMessageServerFn({
							data: {
								chatId,
								messageId: responseMessage.id,
								parts: JSON.stringify(partsToSave),
								metadata: JSON.stringify(responseMessage.metadata),
							},
						});
					},
					onError: (error) => {
						console.error("toUIMessageStreamResponse error:", error);
						return (error as any).message;
					},
				});
			},
		},
	},
});
