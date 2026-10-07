import { httpRouter } from "convex/server";
import { z } from "zod";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

const providerNames = [
	"gemini",
	"openai",
	"anthropic",
	"openrouter",
	"xai",
] as const;
const requestBodySchema = z.object({
	authId: z.string().min(1),
	provider: z.enum(providerNames),
});

const isAuthorized = (provided: string, expected: string) => {
	let difference = provided.length ^ expected.length;
	const length = Math.max(provided.length, expected.length);
	for (let index = 0; index < length; index++) {
		difference |=
			(provided.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
	}
	return difference === 0;
};

http.route({
	path: "/internal/provider-api-key",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const expectedSecret = process.env.BAYCHAT_INTERNAL_API_SECRET;
		const authorization = request.headers.get("authorization") ?? "";
		const providedSecret = authorization.startsWith("Bearer ")
			? authorization.slice("Bearer ".length)
			: "";

		if (!expectedSecret || !isAuthorized(providedSecret, expectedSecret)) {
			return new Response(null, { status: 401 });
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			return new Response(null, { status: 400 });
		}
		const parsedBody = requestBodySchema.safeParse(body);
		if (!parsedBody.success) return new Response(null, { status: 400 });

		const apiKey = await ctx.runQuery(
			internal.providerApiKeys.getForServer,
			parsedBody.data,
		);

		return Response.json(
			{ apiKey },
			{ headers: { "Cache-Control": "no-store" } },
		);
	}),
});

export default http;
