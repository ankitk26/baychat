import { ApiTokens } from "convex-api-tokens";
import { components } from "./_generated/api";

export const apiTokens = new ApiTokens(components.apiTokens, {
	API_TOKENS_ENCRYPTION_KEY: process.env.API_TOKENS_ENCRYPTION_KEY,
});
