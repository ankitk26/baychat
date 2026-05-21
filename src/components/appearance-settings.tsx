import { useRouteContext, useRouter } from "@tanstack/react-router";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { TabsContent } from "~/components/ui/tabs";
import { setAppFont } from "~/server-fns/app-font";
import {
	appearanceStoreActions,
	useAppearanceStore,
} from "~/stores/appearance-store";
import { AppFont } from "~/types";
import TokenUsageByModel from "./token-usage-by-model";

export default function AppearanceSettings() {
	const { appFont } = useRouteContext({ from: "__root__" });
	const router = useRouter();

	const showTokenUsage = useAppearanceStore((store) => store.showTokenUsage);

	const toggleFont = () => {
		const updatedFont: AppFont =
			appFont === "font-mono" ? "font-sans" : "font-mono";
		// router.invalidate refreshes the route context
		setAppFont({ data: updatedFont }).then(() => router.invalidate());
	};

	return (
		<TabsContent className="flex flex-col gap-10" value="appearance">
			{/* Typography */}
			<section className="flex flex-col gap-4">
				<header className="flex flex-col gap-1">
					<h2 className="text-base font-semibold">Typography</h2>
					<p className="text-sm text-muted-foreground">
						Customize the font family used throughout the application
					</p>
				</header>

				<div className="rounded-lg border bg-card p-4">
					<div className="flex items-center justify-between">
						<Label className="font-medium" htmlFor="mono-font">
							Use monospace font
						</Label>

						<Switch
							aria-label="Enable mono font"
							checked={appFont === "font-mono"}
							id="mono-font"
							onCheckedChange={toggleFont}
						/>
					</div>
				</div>
			</section>

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
