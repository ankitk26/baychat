import type { JSONValue } from "ai";
import { z } from "zod";

/** An AI SDK provider-metadata bag (`providerMetadata.<name>`). */
type MetadataBag = { [key: string]: JSONValue | undefined };

const convexStorageSchema = z.looseObject({ storageId: z.string() });

/** Decode the Convex storage id from an AI SDK provider metadata bag. */
export const getConvexStorageId = (
	metadata: MetadataBag | null | undefined,
): string | undefined =>
	convexStorageSchema.nullish().catch(undefined).parse(metadata)?.storageId;

const baychatTextSchema = z.looseObject({ textContent: z.string() });

/** Decode the extracted text content baychat stores alongside a file part. */
export const getBaychatTextContent = (
	metadata: MetadataBag | null | undefined,
): string =>
	baychatTextSchema.nullish().catch(null).parse(metadata)?.textContent ?? "";
