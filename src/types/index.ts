import type { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import type { api } from "convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { z } from "zod";

// Create type for /api/chat request body's model
export type Model = {
	name: string;
	openRouterModelId: string;
	modelId: string;
	isFree: boolean;
};

// Model + isAvailable
export type ModelWithAvailability = Model & { isAvailable: boolean };

// Type for models list
export type ProviderGroup = {
	provider: string;
	key: string;
	models: Model[];
};

// Provider Group + isAvailable (decided after analyzing API Keys)
export interface ProviderGroupWithAvailability extends Omit<
	ProviderGroup,
	"models"
> {
	models: ModelWithAvailability[];
}

// API Keys type
export type ApiKeys = {
	gemini: string;
	openai: string;
	anthropic: string;
	openrouter: string;
	xai: string;
};

export const defaultApiKeys: ApiKeys = {
	gemini: "",
	openai: "",
	anthropic: "",
	openrouter: "",
	xai: "",
};

export type Provider = keyof ApiKeys;

export type SidebarChatType = FunctionReturnType<
	typeof api.chats.getPinnedChats
>[0];
export type SidebarFolder = FunctionReturnType<
	typeof api.folders.getFoldersWithChats
>[0];

export const messageMetadataSchema = z.object({
	createdAt: z.number().optional(),
	modelId: z.string().optional(),
	modelName: z.string().optional(),
	totalTokens: z.float64().optional(),
});
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
// system role not needed for now
export type CustomUIMessage = Omit<UIMessage<MessageMetadata>, "role"> & {
	role: "user" | "assistant";
};

export type AppFont = "font-mono" | "font-sans";

export type ChatSendMessageFunction =
	UseChatHelpers<CustomUIMessage>["sendMessage"];

export type ChatRegenerateFunction =
	UseChatHelpers<CustomUIMessage>["regenerate"];
