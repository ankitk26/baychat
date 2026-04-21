export const defaultSelectedModel = {
	name: "Gemini 2.5 Flash",
	openRouterModelId: "google/gemini-2.5-flash",
	modelId: "gemini-2.5-flash",
	isFree: true,
} as const;

const geminiModels = {
	provider: "Google",
	key: "google",
	models: [
		defaultSelectedModel,
		{
			name: "Gemini 2.5 Pro",
			openRouterModelId: "google/gemini-2.5-pro",
			modelId: "gemini-2.5-pro",
			isFree: false,
		},
		{
			name: "Gemini 3 Flash",
			openRouterModelId: "google/gemini-3-flash-preview",
			modelId: "gemini-3-flash-preview",
			isFree: false,
		},
		{
			name: "Gemini 3 Pro",
			openRouterModelId: "google/gemini-3-pro-preview",
			modelId: "gemini-3-pro-preview",
			isFree: false,
		},
		{
			name: "Gemini 3.1 Pro",
			openRouterModelId: "google/gemini-3.1-pro-preview",
			modelId: "gemini-3.1-pro-preview",
			isFree: false,
		},
		{
			name: "Gemini 3.1 Flash Lite",
			openRouterModelId: "google/gemini-3.1-flash-lite-preview",
			modelId: "gemini-3.1-flash-lite-preview",
			isFree: false,
		},
		{
			name: "Nano Banana",
			openRouterModelId: "google/gemini-2.5-flash-image",
			modelId: "gemini-2.5-flash-image",
			isFree: false,
		},
		{
			name: "Nano Banana Pro",
			openRouterModelId: "google/gemini-3-pro-image-preview",
			modelId: "nano-banana-pro-preview",
			isFree: false,
		},
		{
			name: "Nano Banana 2",
			openRouterModelId: "google/gemini-3.1-flash-image-preview",
			modelId: "gemini-3-pro-image-preview",
			isFree: false,
		},
	] as const,
} as const;

const deepseekModels = {
	provider: "DeepSeek",
	key: "deepseek",
	models: [
		{
			name: "DeepSeek R1 0528",
			openRouterModelId: "deepseek/deepseek-r1-0528",
			modelId: "deepseek/deepseek-r1-0528",
			isFree: false,
		},
		{
			name: "DeepSeek R1",
			openRouterModelId: "deepseek/deepseek-r1",
			modelId: "deepseek/deepseek-r1",
			isFree: false,
		},
		{
			name: "DeepSeek V3 (0324)",
			openRouterModelId: "deepseek/deepseek-chat-v3-0324",
			modelId: "deepseek/deepseek-chat-v3-0324",
			isFree: false,
		},
		{
			name: "DeepSeek V3.1",
			openRouterModelId: "deepseek/deepseek-chat-v3.1",
			modelId: "deepseek/deepseek-chat-v3.1",
			isFree: false,
		},
		{
			name: "DeepSeek V3.2",
			openRouterModelId: "deepseek/deepseek-v3.2",
			modelId: "deepseek/deepseek-v3.2",
			isFree: false,
		},
	] as const,
} as const;

const openAiModels = {
	provider: "OpenAI",
	key: "openai",
	models: [
		{
			name: "o3",
			openRouterModelId: "openai/o3",
			modelId: "o3",
			isFree: false,
		},
		{
			name: "o3 Mini",
			openRouterModelId: "openai/o3-mini",
			modelId: "o3-mini",
			isFree: false,
		},
		{
			name: "o4",
			openRouterModelId: "openai/gpt-4o-mini",
			modelId: "gpt-4o-mini",
			isFree: false,
		},
		{
			name: "o4 Mini",
			openRouterModelId: "openai/gpt-4o",
			modelId: "gpt-4o",
			isFree: false,
		},
		{
			name: "GPT 5",
			openRouterModelId: "openai/gpt-5",
			modelId: "gpt-5",
			isFree: false,
		},
		{
			name: "GPT 5 mini",
			openRouterModelId: "openai/gpt-5-mini",
			modelId: "gpt-5-mini",
			isFree: false,
		},
		{
			name: "GPT 5 nano",
			openRouterModelId: "openai/gpt-5-nano",
			modelId: "gpt-5-nano",
			isFree: false,
		},
		{
			name: "GPT 5.2",
			openRouterModelId: "openai/gpt-5.2",
			modelId: "gpt-5.2",
			isFree: false,
		},
		{
			name: "GPT 5.3 Codex",
			openRouterModelId: "openai/gpt-5.3-codex",
			modelId: "gpt-5.3-codex",
			isFree: false,
		},
		{
			name: "GPT 5.4",
			openRouterModelId: "openai/gpt-5.4",
			modelId: "gpt-5.4",
			isFree: false,
		},
		{
			name: "GPT 5.4 Mini",
			openRouterModelId: "openai/gpt-5.4-mini",
			modelId: "gpt-5.4-mini",
			isFree: false,
		},
		{
			name: "GPT 5.4 Nano",
			openRouterModelId: "openai/gpt-5.4-nano",
			modelId: "gpt-5.4-nano",
			isFree: false,
		},
		{
			name: "GPT 5.4 Pro",
			openRouterModelId: "openai/gpt-5.4-pro",
			modelId: "gpt-5.4-pro",
			isFree: false,
		},
	] as const,
} as const;

const anthropicModels = {
	provider: "Anthropic",
	key: "anthropic",
	models: [
		{
			name: "Claude 3.5 Sonnet",
			openRouterModelId: "anthropic/claude-3.5-sonnet",
			modelId: "claude-3-5-sonnet-latest",
			isFree: false,
		},
		{
			name: "Claude 3.7 Sonnet",
			openRouterModelId: "anthropic/claude-3.7-sonnet",
			modelId: "claude-3-7-sonnet-latest",
			isFree: false,
		},
		{
			name: "Claude Sonnet 4",
			openRouterModelId: "anthropic/claude-sonnet-4",
			modelId: "claude-sonnet-4-0",
			isFree: false,
		},
		{
			name: "Claude Opus 4",
			openRouterModelId: "anthropic/claude-opus-4",
			modelId: "claude-opus-4-0",
			isFree: false,
		},
		{
			name: "Claude Opus 4.5",
			openRouterModelId: "anthropic/claude-opus-4.5",
			modelId: "claude-opus-4-5",
			isFree: false,
		},
		{
			name: "Claude Opus 4.6",
			openRouterModelId: "anthropic/claude-opus-4.6",
			modelId: "claude-opus-4-6",
			isFree: false,
		},
		{
			name: "Claude Sonnet 4.6",
			openRouterModelId: "anthropic/claude-sonnet-4.6",
			modelId: "claude-sonnet-4-6",
			isFree: false,
		},
		{
			name: "Claude Opus 4.7",
			openRouterModelId: "anthropic/claude-opus-4.7",
			modelId: "claude-opus-4-7",
			isFree: false,
		},
	] as const,
} as const;

const xAiModels = {
	provider: "xAI",
	key: "xai",
	models: [
		{
			name: "Grok 3",
			openRouterModelId: "x-ai/grok-3-beta",
			modelId: "grok-3-latest",
			isFree: false,
		},
		{
			name: "Grok 3 Mini",
			openRouterModelId: "x-ai/grok-3-mini-beta",
			modelId: "grok-3-mini-latest",
			isFree: false,
		},
		{
			name: "Grok 4",
			openRouterModelId: "x-ai/grok-4",
			modelId: "grok-4",
			isFree: false,
		},
		{
			name: "Grok 4 Fast",
			openRouterModelId: "x-ai/grok-4-fast",
			modelId: "grok-4-fast-non-reasoning",
			isFree: false,
		},
		{
			name: "Grok 4.1 Fast",
			openRouterModelId: "x-ai/grok-4.1-fast",
			modelId: "grok-4-1-fast-non-reasoning",
			isFree: false,
		},
	] as const,
} as const;

const moonshotModels = {
	provider: "Moonshot",
	key: "moonshot",
	models: [
		{
			name: "Kimi K2",
			openRouterModelId: "moonshotai/kimi-k2",
			modelId: "moonshotai/kimi-k2",
			isFree: false,
		},
		{
			name: "Kimi K2 Thinking",
			openRouterModelId: "moonshotai/kimi-k2-thinking",
			modelId: "moonshotai/kimi-k2-thinking",
			isFree: false,
		},
		{
			name: "Kimi K2.5",
			openRouterModelId: "moonshotai/kimi-k2.5",
			modelId: "moonshotai/kimi-k2.5",
			isFree: false,
		},
		{
			name: "Kimi K2.6",
			openRouterModelId: "moonshotai/kimi-k2.6",
			modelId: "moonshotai/kimi-k2.6",
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
			modelId: "z-ai/glm-4.6v",
			isFree: false,
		},
		{
			name: "GLM 4.7",
			openRouterModelId: "z-ai/glm-4.7",
			modelId: "z-ai/glm-4.7",
			isFree: false,
		},
		{
			name: "GLM 5",
			openRouterModelId: "z-ai/glm-5",
			modelId: "z-ai/glm-5",
			isFree: false,
		},
		{
			name: "GLM 5.1",
			openRouterModelId: "z-ai/glm-5.1",
			modelId: "z-ai/glm-5.1",
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
			modelId: "minimax/minimax-m2.1",
			isFree: false,
		},
		{
			name: "MiniMax M2.5",
			openRouterModelId: "minimax/minimax-m2.5",
			modelId: "minimax/minimax-m2.5",
			isFree: false,
		},
		{
			name: "MiniMax M2.7",
			openRouterModelId: "minimax/minimax-m2.7",
			modelId: "minimax/minimax-m2.7",
			isFree: false,
		},
	] as const,
} as const;

const xiaomiModels = {
	provider: "Xiaomi",
	key: "xiaomi",
	models: [
		{
			name: "MiMo-V2-Flash",
			openRouterModelId: "xiaomi/mimo-v2-flash",
			modelId: "xiaomi/mimo-v2-flash",
			isFree: false,
		},
		{
			name: "MiMo-V2-Omni",
			openRouterModelId: "xiaomi/mimo-v2-omni",
			modelId: "xiaomi/mimo-v2-omni",
			isFree: false,
		},
		{
			name: "MiMo-V2-Pro",
			openRouterModelId: "xiaomi/mimo-v2-pro",
			modelId: "xiaomi/mimo-v2-pro",
			isFree: false,
		},
	] as const,
} as const;

const byteDanceModels = {
	provider: "ByteDance",
	key: "byteDance",
	models: [
		{
			name: "Seedream 4.5",
			openRouterModelId: "bytedance-seed/seedream-4.5",
			modelId: "bytedance-seed/seedream-4.5",
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
	byteDanceModels,
] as const;
