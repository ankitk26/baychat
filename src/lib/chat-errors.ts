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

const getErrorText = (error: unknown) => {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	return "";
};

export const normalizeChatError = (error: unknown): ChatError => {
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

	const status =
		typeof error === "object" && error !== null && "status" in error
			? Number(error.status)
			: typeof error === "object" && error !== null && "statusCode" in error
				? Number(error.statusCode)
				: undefined;

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

export const chatErrorResponse = (error: unknown) => {
	const chatError = normalizeChatError(error);
	return new Response(chatError.message, {
		status: chatError.status,
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
