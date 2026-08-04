import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { formatTokens } from "~/lib/format-tokens";
import ModelProviderIcon from "./model-provider-icon";
import { Skeleton } from "./ui/skeleton";

export default function TokenUsageByModel() {
	const { data: tokenUsage, isPending } = useQuery(
		convexQuery(api.messages.tokensByModel, {}),
	);

	if (isPending) {
		return (
			<div aria-busy="true" className="mt-6 flex flex-col gap-2">
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-full" />
				<Skeleton className="h-5 w-full" />
			</div>
		);
	}

	if (!tokenUsage || tokenUsage.length === 0) {
		return null;
	}

	const totalTokens = tokenUsage.reduce(
		(sum: number, item: { tokens: number }) => sum + (item?.tokens || 0),
		0,
	);

	return (
		<div className="mt-6 flex flex-col gap-4">
			<header className="flex flex-col gap-1">
				<h3 className="text-base font-medium text-pretty">
					Model-wise Token Usage
				</h3>
				<p className="text-sm text-muted-foreground">
					Breakdown of tokens used across different AI models
				</p>
			</header>

			<div className="flex flex-col gap-3">
				{tokenUsage.map((usageItem) => {
					const pct =
						totalTokens > 0
							? Math.round((usageItem.tokens / totalTokens) * 100)
							: 0;

					return (
						<div
							className="rounded-lg border bg-card p-3"
							key={usageItem.model}
						>
							<div className="flex items-center justify-between gap-4">
								<div className="flex min-w-0 items-center gap-3">
									<span
										aria-hidden
										className="flex size-4 shrink-0 items-center justify-center text-foreground"
									>
										<ModelProviderIcon provider={usageItem.provider} />
									</span>
									<span className="truncate text-sm font-medium">
										{usageItem.model}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<span className="text-sm text-muted-foreground tabular-nums">
										{formatTokens(usageItem.tokens)}
									</span>
								</div>
							</div>

							<div className="mt-3">
								<div
									aria-label={`${usageItem.model} token share`}
									aria-valuemax={100}
									aria-valuemin={0}
									aria-valuenow={pct}
									className="h-2 w-full rounded-md bg-muted"
									role="progressbar"
								>
									<div
										className="h-2 rounded-md bg-primary"
										style={{ width: `${pct}%` }}
									/>
								</div>
							</div>
						</div>
					);
				})}

				<div className="rounded-lg border bg-muted/50 p-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Total</span>
						<span className="text-sm font-medium tabular-nums">
							{formatTokens(totalTokens)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
