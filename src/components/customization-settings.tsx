import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import {
	customizationStoreActions,
	useCustomizationStore,
} from "~/stores/customization-store";

export default function CustomizationSettings() {
	const persistedPrompt = useCustomizationStore(
		(store) => store.customSystemPrompt,
	);
	const [draft, setDraft] = useState(persistedPrompt);

	const handleSave = () => {
		customizationStoreActions.setCustomSystemPrompt(draft);
		toast.success("Custom system prompt saved");
	};

	return (
		<TabsContent className="flex flex-col gap-10" value="customization">
			{/* System Prompt */}
			<section className="flex flex-col gap-4">
				<header className="flex flex-col gap-1">
					<h2 className="text-base font-semibold">System Prompt</h2>
					<p className="text-sm text-muted-foreground">
						Add a custom system prompt that will be appended to the default
						system instructions sent with every message
					</p>
				</header>

				<div className="rounded-lg border bg-card p-4">
					<div className="flex flex-col gap-2">
						<Label className="font-medium" htmlFor="custom-system-prompt">
							Custom prompt
						</Label>
						<Textarea
							className="min-h-32 resize-y"
							id="custom-system-prompt"
							onChange={(e) => setDraft(e.target.value)}
							placeholder="e.g. Always respond in Spanish, or use a formal tone..."
							value={draft}
						/>
						<p className="text-xs text-muted-foreground">
							This prompt will be added after the default system instructions.
							Leave empty to use only the defaults.
						</p>
					</div>
				</div>

				<Button onClick={handleSave}>Save</Button>
			</section>
		</TabsContent>
	);
}
