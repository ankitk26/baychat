/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as chats from "../chats.js";
import type * as files from "../files.js";
import type * as folders from "../folders.js";
import type * as functions from "../functions.js";
import type * as http from "../http.js";
import type * as imageGenerations from "../imageGenerations.js";
import type * as messages from "../messages.js";
import type * as model_chats from "../model/chats.js";
import type * as model_users from "../model/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  chats: typeof chats;
  files: typeof files;
  folders: typeof folders;
  functions: typeof functions;
  http: typeof http;
  imageGenerations: typeof imageGenerations;
  messages: typeof messages;
  "model/chats": typeof model_chats;
  "model/users": typeof model_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
