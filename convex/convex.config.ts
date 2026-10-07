import betterAuth from "@convex-dev/better-auth/convex.config";
import apiTokensComponent from "convex-api-tokens/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(betterAuth);
app.use(apiTokensComponent);

export default app;
