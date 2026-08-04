import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { TabsContent } from "~/components/ui/tabs";
import {
	appearanceStoreActions,
	useAppearanceStore,
} from "~/stores/appearance-store";
import TokenUsageByModel from "./token-usage-by-model";

export default function AppearanceSettings() {
	const showTokenUsage = useAppearanceStore((store) => store.showTokenUsage);

	return (
		<TabsContent className="flex flex-col gap-10" value="appearance">
			{/* Stats */}
			<section className="flex flex-col gap-4">
				<header className="flex flex-col gap-1">
					<h2 className="text-base font-semibold">Usage Stats</h2>
					<p className="text-sm text-muted-foreground">
						Control the display of usage statistics in the application
					</p>
				</header>

				<div className="rounded-lg border bg-card">
					<div
						className={`flex items-center justify-between p-4 ${showTokenUsage ? "border-b" : ""}`}
					>
						<div className="flex flex-col gap-1">
							<Label className="font-medium" htmlFor="show-token-usage">
								Show token usage
							</Label>
							<p className="text-xs text-muted-foreground">
								Display token consumption breakdown by model
							</p>
						</div>

						<Switch
							aria-label="Show token usage"
							checked={showTokenUsage}
							id="show-token-usage"
							onCheckedChange={appearanceStoreActions.toggleShowTokenUsage}
						/>
					</div>

					{showTokenUsage && (
						<div className="p-4 pt-0">
							<TokenUsageByModel />
						</div>
					)}
				</div>
			</section>
		</TabsContent>
	);
}
