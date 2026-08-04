import { allModelProviders } from "../src/constants/model-providers";
import { internalMutation } from "./_generated/server";

/**
 * Backfills provider keys for userTokenUsage rows created before provider was
 * stored separately from the model name.
 *
 * Run once with:
 *   pnpm exec convex run migrations:migrateTokenUsageProviders
 */
export const migrateTokenUsageProviders = internalMutation({
	handler: async (ctx) => {
		const providerByModelName = new Map<string, string>();

		for (const provider of allModelProviders) {
			for (const model of provider.models) {
				providerByModelName.set(model.name, provider.key);
			}
		}

		const rows = await ctx.db.query("userTokenUsage").collect();
		let migrated = 0;
		let skipped = 0;

		for (const row of rows) {
			// The field is present on newly-created rows. Keep this migration
			// idempotent so it is safe to retry.
			if (row.provider) {
				skipped++;
				continue;
			}

			const provider = providerByModelName.get(row.model);
			if (!provider) {
				skipped++;
				continue;
			}

			await ctx.db.patch(row._id, { provider });
			migrated++;
		}

		return { migrated, skipped };
	},
});
