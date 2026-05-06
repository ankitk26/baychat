import {
	CheckIcon,
	FloppyDiskIcon,
	ArrowCounterClockwiseIcon,
	TextboxIcon,
} from "@phosphor-icons/react";
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

	const hasChanges = draft !== persistedPrompt;

	const handleSave = () => {
		customizationStoreActions.setCustomSystemPrompt(draft);
		toast.success("Custom system prompt saved");
	};

	const handleReset = () => {
		setDraft(persistedPrompt);
	};

	const charCount = draft.length;

	return (
		<TabsContent className="space-y-4" value="customization">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<h3 className="text-base font-semibold text-foreground">
						System Prompt
					</h3>
					{!hasChanges && draft && (
						<div className="flex items-center gap-1 text-xs text-muted-foreground">
							<CheckIcon className="h-3 w-3" />
							Saved
						</div>
					)}
				</div>
				<p className="mt-1 text-sm text-muted-foreground">
					Add a custom system prompt that will be appended to the default system
					instructions sent with every message.
				</p>
			</div>

			{/* Prompt Input */}
			<div className="rounded-lg border">
				<div className="flex items-center justify-between border-b px-3 py-2">
					<div className="flex items-center gap-2">
						<TextboxIcon className="h-3.5 w-3.5 text-muted-foreground" />
						<Label
							className="text-xs font-medium text-muted-foreground"
							htmlFor="custom-system-prompt"
						>
							Custom prompt
						</Label>
					</div>
					<span
						className={`text-xs tabular-nums ${
							charCount > 2000 ? "text-destructive" : "text-muted-foreground"
						}`}
					>
						{charCount}
					</span>
				</div>
				<div className="p-3">
					<Textarea
						className="min-h-32 resize-y text-sm"
						id="custom-system-prompt"
						onChange={(e) => setDraft(e.target.value)}
						placeholder="e.g. Always respond in Spanish, or use a formal tone..."
						value={draft}
					/>
				</div>
				<div className="border-t px-3 py-2">
					<p className="text-xs text-muted-foreground">
						This prompt will be added after the default system instructions.
						Leave empty to use only the defaults.
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2">
				<Button
					className="w-full lg:w-auto"
					disabled={!hasChanges}
					onClick={handleSave}
				>
					<FloppyDiskIcon className="mr-1 h-3.5 w-3.5" />
					Save
				</Button>
				{hasChanges && (
					<Button
						className="w-full lg:w-auto"
						variant="ghost"
						onClick={handleReset}
					>
						<ArrowCounterClockwiseIcon className="mr-1 h-3.5 w-3.5" />
						Reset
					</Button>
				)}
			</div>
		</TabsContent>
	);
}
