import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getProviderApiKey } from "~/lib/provider-api-keys.server";
import { getAuthUser } from "~/server-fns/get-auth";
import type { Provider } from "~/types";

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

const titleModelForKey = (provider: Provider, apiKey: string) => {
	switch (provider) {
		case "openrouter":
			return createOpenRouter({ apiKey }).chat("google/gemini-2.5-flash");
		case "gemini":
			return createGoogleGenerativeAI({ apiKey })("gemini-2.5-flash");
		case "anthropic":
			return createAnthropic({ apiKey })("claude-3-5-haiku-latest");
		case "xai":
			return createXai({ apiKey })("grok-4");
		case "openai":
			return createOpenAI({ apiKey })("gpt-5.4-nano");
	}
};

const resolveTitleModel = async (authId: string, useOpenRouter: boolean) => {
	if (useOpenRouter) {
		const openRouterKey = await getProviderApiKey(authId, "openrouter");
		if (openRouterKey?.trim()) {
			return titleModelForKey("openrouter", openRouterKey);
		}
	}

	for (const provider of ["gemini", "anthropic", "xai", "openai"] as const) {
		const apiKey = await getProviderApiKey(authId, provider);
		if (apiKey?.trim()) return titleModelForKey(provider, apiKey);
	}

	if (!useOpenRouter) {
		const openRouterKey = await getProviderApiKey(authId, "openrouter");
		if (openRouterKey?.trim()) {
			return titleModelForKey("openrouter", openRouterKey);
		}
	}

	const titleGenerationKey = process.env.OPENROUTER_CHAT_TITLE_GENERATION_KEY;
	if (!titleGenerationKey) {
		throw new Error("Chat title generation is not configured.");
	}
	return createOpenRouter({ apiKey: titleGenerationKey }).chat(
		"google/gemini-2.5-flash",
	);
};

export const getChatTitle = createServerFn({ method: "POST" })
	.validator(
		z.object({
			userMessage: z.string().trim().min(1),
			useOpenRouter: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const authUser = await getAuthUser();
		if (!authUser || !authUser._id) {
			throw new Error("Authentication is required to generate a title.");
		}
		const model = await resolveTitleModel(authUser._id, data.useOpenRouter);
		try {
			const { text: generatedTitle } = await generateText({
				model,
				system: TITLE_SYSTEM_PROMPT,
				prompt: buildTitlePrompt(data.userMessage),
			});
			return generatedTitle;
		} catch {
			throw new Error("Could not generate a chat title.");
		}
	});
