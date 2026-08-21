import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import type { ApiKeys } from "~/types";

const TITLE_SYSTEM_PROMPT =
	"You generate short chat titles. " +
	"Return ONLY the title text (no labels like 'Title:' and no quotes). " +
	"Use 2-10 words. " +
	"No conversational filler.";

const buildTitlePrompt = (userMessage: string) =>
	"Write a concise title for this user message:\n\n" +
	"'''\n" +
	userMessage +
	"\n'''\n\n" +
	"Return only the title.";

const hasKey = (key: string) => key.trim() !== "";

const isTrialRequest = (apiKeys: ApiKeys) =>
	!hasKey(apiKeys.gemini) &&
	!hasKey(apiKeys.anthropic) &&
	!hasKey(apiKeys.xai) &&
	!hasKey(apiKeys.openai) &&
	!hasKey(apiKeys.openrouter);

// OpenRouter (when enabled) > gemini > anthropic > xai > openai
const resolveTitleModel = (apiKeys: ApiKeys, useOpenRouter: boolean) => {
	if (useOpenRouter && hasKey(apiKeys.openrouter)) {
		return createOpenRouter({ apiKey: apiKeys.openrouter }).chat(
			"google/gemini-2.5-flash",
		);
	}
	if (isTrialRequest(apiKeys)) {
		const titleGenerationKey = process.env.OPENROUTER_CHAT_TITLE_GENERATION_KEY;
		if (!titleGenerationKey) {
			throw new Error("Chat title generation is not configured.");
		}
		return createOpenRouter({ apiKey: titleGenerationKey }).chat(
			"google/gemini-2.5-flash",
		);
	}

	if (hasKey(apiKeys.gemini)) {
		return createGoogleGenerativeAI({ apiKey: apiKeys.gemini })(
			"gemini-2.5-flash",
		);
	}

	if (hasKey(apiKeys.anthropic)) {
		return createAnthropic({ apiKey: apiKeys.anthropic })(
			"claude-3-5-haiku-latest",
		);
	}

	if (hasKey(apiKeys.xai)) {
		return createXai({ apiKey: apiKeys.xai })("grok-4");
	}

	if (hasKey(apiKeys.openai)) {
		return createOpenAI({ apiKey: apiKeys.openai })("gpt-5.4-nano");
	}

	// Only an OpenRouter key is available (toggle off)
	return createOpenRouter({ apiKey: apiKeys.openrouter }).chat(
		"google/gemini-2.5-flash",
	);
};

export const getChatTitle = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			userMessage: z.string().trim().min(1),
			apiKeys: z.object({
				gemini: z.string(),
				openai: z.string(),
				anthropic: z.string(),
				openrouter: z.string(),
				xai: z.string(),
			}),
			useOpenRouter: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const model = resolveTitleModel(data.apiKeys, data.useOpenRouter);
		const { text: generatedTitle } = await generateText({
			model,
			system: TITLE_SYSTEM_PROMPT,
			prompt: buildTitlePrompt(data.userMessage),
		});

		return generatedTitle;
	});
