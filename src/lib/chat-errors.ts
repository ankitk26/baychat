import { z } from "zod";

export type ChatErrorCode =
	| "trial_exhausted"
	| "missing_api_key"
	| "invalid_api_key"
	| "rate_limited"
	| "model_unavailable"
	| "provider_unavailable"
	| "unknown";

export class ChatError extends Error {
	readonly code: ChatErrorCode;
	readonly status: number;

	constructor(code: ChatErrorCode, message: string, status = 500) {
		super(message);
		this.name = "ChatError";
		this.code = code;
		this.status = status;
	}
}

// Caught values arrive untyped from throw sites; these helpers normalize
// whatever a provider or transport threw into the chat error domain.
const getErrorText = <T>(error: T): string => {
	if (error instanceof Error) return error.message;
	return z.string().catch("").parse(error);
};

const thrownStatusSchema = z.looseObject({
	status: z.coerce.number().optional(),
});

const thrownStatusCodeSchema = z.looseObject({
	statusCode: z.coerce.number().optional(),
});

const getStatus = <T>(error: T): number | undefined => {
	const parsedStatus = thrownStatusSchema.safeParse(error);
	const status = parsedStatus.success ? parsedStatus.data.status : undefined;
	if (status !== undefined) return status;

	const parsedStatusCode = thrownStatusCodeSchema.safeParse(error);
	return parsedStatusCode.success
		? parsedStatusCode.data.statusCode
		: undefined;
};

export const normalizeChatError = <T>(error: T): ChatError => {
	if (error instanceof ChatError) return error;

	const message = getErrorText(error);
	const lowerMessage = message.toLowerCase();
	const resetDate = message.match(
		/Your trial resets on (\d{4}-\d{2}-\d{2})\./,
	)?.[1];

	if (message.includes("free messages")) {
		return new ChatError(
			"trial_exhausted",
			`You've used all 5 free messages. Your trial resets on ${resetDate ?? "your next reset date"}. Add your own API key to keep chatting.`,
			429,
		);
	}

	if (
		lowerMessage.includes("api key") &&
		lowerMessage.includes("not provided")
	) {
		return new ChatError("missing_api_key", message, 400);
	}

	const status = getStatus(error);

	if (
		status === 401 ||
		status === 403 ||
		lowerMessage.includes("unauthorized")
	) {
		return new ChatError(
			"invalid_api_key",
			"Your API key was rejected. Check or update it in Settings.",
			401,
		);
	}

	if (status === 429 || lowerMessage.includes("rate limit")) {
		return new ChatError(
			"rate_limited",
			"This provider is temporarily rate-limited. Please try again shortly.",
			429,
		);
	}

	if (
		lowerMessage.includes("model not found") ||
		lowerMessage.includes("model is not available") ||
		lowerMessage.includes("does not exist")
	) {
		return new ChatError(
			"model_unavailable",
			"This model is currently unavailable. Please try another model.",
			400,
		);
	}

	if (
		lowerMessage.includes("timeout") ||
		lowerMessage.includes("timed out") ||
		lowerMessage.includes("fetch failed") ||
		lowerMessage.includes("network")
	) {
		return new ChatError(
			"provider_unavailable",
			"The AI provider could not be reached. Please try again in a moment.",
			503,
		);
	}

	return new ChatError(
		"unknown",
		"Something went wrong while generating the response. Please try again.",
		500,
	);
};

export const chatErrorResponse = <T>(error: T): Response => {
	const chatError = normalizeChatError(error);
	return new Response(chatError.message, {
		status: chatError.status,
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
