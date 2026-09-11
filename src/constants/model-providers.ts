export const defaultSelectedModel = {
	name: "Gemini 2.5 Flash",
	openRouterModelId: "google/gemini-2.5-flash",
	modelId: "gemini-2.5-flash",
	isFree: true,
	releasedAt: "2025-06-17",
} as const;

const geminiModels = {
	provider: "Google",
	key: "google",
	models: [
		defaultSelectedModel,
		{
			name: "Gemini 3.1 Pro",
			openRouterModelId: "google/gemini-3.1-pro-preview",
			releasedAt: "2026-02-19",
			modelId: "gemini-3.1-pro-preview",
			isFree: false,
		},
		{
			name: "Gemini 3.1 Flash Lite",
			openRouterModelId: "google/gemini-3.1-flash-lite-preview",
			releasedAt: "2026-03-03",
			modelId: "gemini-3.1-flash-lite-preview",
			isFree: false,
		},
		{
			name: "Gemini 3.5 Flash",
			openRouterModelId: "google/gemini-3.5-flash",
			releasedAt: "2026-05-19",
			modelId: "gemini-3.5-flash",
			isFree: false,
		},
		{
			name: "Gemini 3.5 Flash Lite",
			openRouterModelId: "google/gemini-3.5-flash-lite",
			releasedAt: "2026-07-21",
			modelId: "gemini-3.5-flash-lite",
			isFree: false,
		},
		{
			name: "Gemini 3.6 Flash",
			openRouterModelId: "google/gemini-3.6-flash",
			releasedAt: "2026-07-21",
			modelId: "gemini-3.6-flash",
			isFree: false,
		},
		{
			name: "Gemini 3.7 Flash",
			openRouterModelId: "google/gemini-3.7-flash",
			releasedAt: "2026-08-13",
			modelId: "gemini-3.7-flash",
			isFree: false,
		},
		{
			name: "Gemini 3.8 Flash",
			openRouterModelId: "google/gemini-3.8-flash",
			releasedAt: "2026-09-02",
			modelId: "gemini-3.8-flash",
			isFree: false,
		},
		{
			name: "Nano Banana",
			openRouterModelId: "google/gemini-2.5-flash-image",
			releasedAt: "2025-08-26",
			modelId: "gemini-2.5-flash-image",
			isFree: false,
		},
		{
			name: "Nano Banana Pro",
			openRouterModelId: "google/gemini-3-pro-image",
			releasedAt: "2026-05-28",
			modelId: "gemini-3-pro-image",
			isFree: false,
		},
		{
			name: "Nano Banana 2",
			openRouterModelId: "google/gemini-3.1-flash-image-preview",
			releasedAt: "2026-02-26",
			modelId: "gemini-3.1-flash-image-preview",
			isFree: false,
		},
	] as const,
} as const;

const deepseekModels = {
	provider: "DeepSeek",
	key: "deepseek",
	models: [
		{
			name: "DeepSeek R1",
			openRouterModelId: "deepseek/deepseek-r1",
			releasedAt: "2025-01-20",
			modelId: "deepseek/deepseek-r1",
			isFree: false,
		},
		{
			name: "DeepSeek V3.1",
			openRouterModelId: "deepseek/deepseek-chat-v3.1",
			releasedAt: "2025-08-21",
			modelId: "deepseek/deepseek-chat-v3.1",
			isFree: false,
		},
		{
			name: "DeepSeek V3.2",
			openRouterModelId: "deepseek/deepseek-v3.2",
			releasedAt: "2025-12-01",
			modelId: "deepseek/deepseek-v3.2",
			isFree: false,
		},
		{
			name: "DeepSeek V4 Flash",
			openRouterModelId: "deepseek/deepseek-v4-flash",
			releasedAt: "2026-09-10",
			modelId: "deepseek/deepseek-v4-flash",
			isFree: false,
		},
		{
			name: "DeepSeek V4 Pro",
			openRouterModelId: "deepseek/deepseek-v4-pro",
			releasedAt: "2026-08-12",
			modelId: "deepseek/deepseek-v4-pro",
			isFree: false,
		},
		{
			name: "DeepSeek V4.1 Flash",
			openRouterModelId: "deepseek/deepseek-v4.1-flash",
			releasedAt: "2026-09-10",
			modelId: "deepseek/deepseek-v4.1-flash",
			isFree: false,
		},
	] as const,
} as const;

const openAiModels = {
	provider: "OpenAI",
	key: "openai",
	models: [
		{
			name: "GPT 5.4",
			openRouterModelId: "openai/gpt-5.4",
			releasedAt: "2026-03-05",
			modelId: "gpt-5.4",
			isFree: false,
		},
		{
			name: "GPT 5.4 Mini",
			openRouterModelId: "openai/gpt-5.4-mini",
			releasedAt: "2026-03-17",
			modelId: "gpt-5.4-mini",
			isFree: false,
		},
		{
			name: "GPT 5.4 Nano",
			openRouterModelId: "openai/gpt-5.4-nano",
			releasedAt: "2026-03-17",
			modelId: "gpt-5.4-nano",
			isFree: false,
		},
		{
			name: "GPT 5.4 Pro",
			openRouterModelId: "openai/gpt-5.4-pro",
			releasedAt: "2026-03-05",
			modelId: "gpt-5.4-pro",
			isFree: false,
		},
		{
			name: "GPT 5.5",
			openRouterModelId: "openai/gpt-5.5",
			releasedAt: "2026-04-23",
			modelId: "gpt-5.5",
			isFree: false,
		},
		{
			name: "GPT 5.5 Pro",
			openRouterModelId: "openai/gpt-5.5-pro",
			releasedAt: "2026-04-23",
			modelId: "gpt-5.5-pro",
			isFree: false,
		},
		{
			name: "GPT 6 Astra",
			openRouterModelId: "openai/gpt-6-astra",
			releasedAt: "2026-09-04",
			modelId: "gpt-6-astra",
			isFree: false,
		},
		{
			name: "GPT 5.6 Sol",
			openRouterModelId: "openai/gpt-5.6-sol",
			releasedAt: "2026-07-09",
			modelId: "gpt-5.6-sol",
			isFree: false,
		},
		{
			name: "GPT 5.6 Luna",
			openRouterModelId: "openai/gpt-5.6-luna",
			releasedAt: "2026-07-09",
			modelId: "gpt-5.6-luna",
			isFree: false,
		},
		{
			name: "GPT 5.6 Terra",
			openRouterModelId: "openai/gpt-5.6-terra",
			releasedAt: "2026-07-09",
			modelId: "gpt-5.6-terra",
			isFree: false,
		},
	] as const,
} as const;

const anthropicModels = {
	provider: "Anthropic",
	key: "anthropic",
	models: [
		{
			name: "Claude 3 Haiku",
			openRouterModelId: "anthropic/claude-3-haiku",
			releasedAt: "2024-03-13",
			modelId: "claude-3-haiku-20240307",
			isFree: false,
		},
		{
			name: "Claude Opus 4.6",
			openRouterModelId: "anthropic/claude-opus-4.6",
			releasedAt: "2026-02-04",
			modelId: "claude-opus-4-6",
			isFree: false,
		},
		{
			name: "Claude Sonnet 4.6",
			openRouterModelId: "anthropic/claude-sonnet-4.6",
			releasedAt: "2026-02-17",
			modelId: "claude-sonnet-4-6",
			isFree: false,
		},
		{
			name: "Claude Opus 4.7",
			openRouterModelId: "anthropic/claude-opus-4.7",
			releasedAt: "2026-04-16",
			modelId: "claude-opus-4-7",
			isFree: false,
		},
		{
			name: "Claude Opus 4.8",
			openRouterModelId: "anthropic/claude-opus-4.8",
			releasedAt: "2026-05-27",
			modelId: "claude-opus-4-8",
			isFree: false,
		},
		{
			name: "Claude Opus 5",
			openRouterModelId: "anthropic/claude-opus-5",
			releasedAt: "2026-07-24",
			modelId: "claude-opus-5",
			isFree: false,
		},
		{
			name: "Claude Fable 5",
			openRouterModelId: "anthropic/claude-fable-5",
			releasedAt: "2026-06-07",
			modelId: "claude-fable-5",
			isFree: false,
		},
		{
			name: "Claude Fable 5.1",
			openRouterModelId: "anthropic/claude-fable-5.1",
			releasedAt: "2026-09-01",
			modelId: "claude-fable-5-1",
			isFree: false,
		},
		{
			name: "Claude Sonnet 5",
			openRouterModelId: "anthropic/claude-sonnet-5",
			releasedAt: "2026-06-29",
			modelId: "claude-sonnet-5-0",
			isFree: false,
		},
	] as const,
} as const;

const xAiModels = {
	provider: "xAI",
	key: "xai",
	models: [
		{
			name: "Grok 4.2",
			openRouterModelId: "x-ai/grok-4.20",
			releasedAt: "2026-03-31",
			modelId: "grok-4.20-0309-reasoning",
			isFree: false,
		},
		{
			name: "Grok 4.3",
			openRouterModelId: "x-ai/grok-4.3",
			releasedAt: "2026-04-30",
			modelId: "grok-4.3",
			isFree: false,
		},
		{
			name: "Grok 4.5",
			openRouterModelId: "x-ai/grok-4.5",
			releasedAt: "2026-07-08",
			modelId: "grok-4.5",
			isFree: false,
		},
		{
			name: "Grok 4.6",
			openRouterModelId: "x-ai/grok-4.6",
			releasedAt: "2026-08-12",
			modelId: "grok-4.6",
			isFree: false,
		},
	] as const,
} as const;

const moonshotModels = {
	provider: "Moonshot",
	key: "moonshot",
	models: [
		{
			name: "Kimi K2.5",
			openRouterModelId: "moonshotai/kimi-k2.5",
			releasedAt: "2026-01-27",
			modelId: "moonshotai/kimi-k2.5",
			isFree: false,
		},
		{
			name: "Kimi K2.6",
			openRouterModelId: "moonshotai/kimi-k2.6",
			releasedAt: "2026-04-21",
			modelId: "moonshotai/kimi-k2.6",
			isFree: false,
		},
		{
			name: "Kimi K2.7 Code",
			openRouterModelId: "moonshotai/kimi-k2.7-code",
			releasedAt: "2026-06-12",
			modelId: "moonshotai/kimi-k2.7-code",
			isFree: false,
		},
		{
			name: "Kimi K3",
			openRouterModelId: "moonshotai/kimi-k3",
			releasedAt: "2026-07-16",
			modelId: "moonshotai/kimi-k3",
			isFree: false,
		},
	] as const,
} as const;

const zaiModels = {
	provider: "Z.ai",
	key: "zai",
	models: [
		{
			name: "GLM 4.6v",
			openRouterModelId: "z-ai/glm-4.6v",
			releasedAt: "2025-12-08",
			modelId: "z-ai/glm-4.6v",
			isFree: false,
		},
		{
			name: "GLM 4.7",
			openRouterModelId: "z-ai/glm-4.7",
			releasedAt: "2025-12-22",
			modelId: "z-ai/glm-4.7",
			isFree: false,
		},
		{
			name: "GLM 5",
			openRouterModelId: "z-ai/glm-5",
			releasedAt: "2026-02-11",
			modelId: "z-ai/glm-5",
			isFree: false,
		},
		{
			name: "GLM 5.1",
			openRouterModelId: "z-ai/glm-5.1",
			releasedAt: "2026-03-27",
			modelId: "z-ai/glm-5.1",
			isFree: false,
		},
		{
			name: "GLM 5.2",
			openRouterModelId: "z-ai/glm-5.2",
			releasedAt: "2026-06-13",
			modelId: "z-ai/glm-5.2",
			isFree: false,
		},
		{
			name: "GLM 5.3",
			openRouterModelId: "z-ai/glm-5.3",
			releasedAt: "2026-08-14",
			modelId: "z-ai/glm-5.3",
			isFree: false,
		},
		{
			name: "GLM 5.3 Flash",
			openRouterModelId: "z-ai/glm-5.3-flash",
			releasedAt: "2026-08-26",
			modelId: "z-ai/glm-5.3-flash",
			isFree: false,
		},
	] as const,
} as const;

const minimaxModels = {
	provider: "MiniMax",
	key: "minimax",
	models: [
		{
			name: "MiniMax M2.1",
			openRouterModelId: "minimax/minimax-m2.1",
			releasedAt: "2025-12-23",
			modelId: "minimax/minimax-m2.1",
			isFree: false,
		},
		{
			name: "MiniMax M2.5",
			openRouterModelId: "minimax/minimax-m2.5",
			releasedAt: "2026-02-12",
			modelId: "minimax/minimax-m2.5",
			isFree: false,
		},
		{
			name: "MiniMax M2.7",
			openRouterModelId: "minimax/minimax-m2.7",
			releasedAt: "2026-03-18",
			modelId: "minimax/minimax-m2.7",
			isFree: false,
		},
		{
			name: "MiniMax M3",
			openRouterModelId: "minimax/minimax-m3",
			releasedAt: "2026-05-31",
			modelId: "minimax/minimax-m3",
			isFree: false,
		},
	] as const,
} as const;

const xiaomiModels = {
	provider: "Xiaomi",
	key: "xiaomi",
	models: [
		{
			name: "MiMo-V2.5",
			openRouterModelId: "xiaomi/mimo-v2.5",
			releasedAt: "2026-04-22",
			modelId: "xiaomi/mimo-v2.5",
			isFree: false,
		},
		{
			name: "MiMo-V2.5-Pro",
			openRouterModelId: "xiaomi/mimo-v2.5-pro",
			releasedAt: "2026-04-22",
			modelId: "xiaomi/mimo-v2.5-pro",
			isFree: false,
		},
	] as const,
} as const;

export const allModelProviders = [
	geminiModels,
	deepseekModels,
	openAiModels,
	anthropicModels,
	xAiModels,
	moonshotModels,
	zaiModels,
	minimaxModels,
	xiaomiModels,
] as const;

type AvailableOpenRouterModelId =
	(typeof allModelProviders)[number]["models"][number]["openRouterModelId"];

export const trialModelIds = [
	"google/gemini-2.5-flash",
	"google/gemini-2.5-flash-image",
	"openai/gpt-5.4-nano",
	"moonshotai/kimi-k2.5",
] as const satisfies readonly AvailableOpenRouterModelId[];

// Truly free models that a trial user can use without consuming the
// trial message quota.
export const freeModelIds: readonly string[] = allModelProviders.flatMap(
	(group) =>
		group.models
			.filter((model) => model.isFree)
			.map((model) => model.openRouterModelId),
);
