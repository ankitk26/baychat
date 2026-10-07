import { createServerFn } from "@tanstack/react-start";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { z } from "zod";
import { fetchAuthQuery } from "~/lib/auth-server";
import { getAuthUser } from "./get-auth";

export const getFileUrl = createServerFn({ method: "GET" })
	.validator(
		z.object({
			storageId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const authData = await getAuthUser();
		if (!authData) {
			throw new Error("Invalid request");
		}

		return fetchAuthQuery(api.files.getFileUrl, {
			storageId: data.storageId as Id<"_storage">,
		});
	});
