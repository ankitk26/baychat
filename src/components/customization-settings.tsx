import {
	CheckIcon,
	FloppyDiskIcon,
	ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { TabsContent } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
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

	const MAX_LENGTH = 1000;

	return (
		<TabsContent className="space-y-4" value="customization">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<h3 className="text-base font-semibold text-foreground">
						Custom Prompt
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
			<div className="relative">
				<Textarea
					className="min-h-32 resize-y pb-8 text-sm"
					id="custom-system-prompt"
					maxLength={MAX_LENGTH}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="e.g. Always respond in Spanish, or use a formal tone..."
					value={draft}
				/>
				<div
					className={cn(
						"pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums",
						draft.length > MAX_LENGTH
							? "text-destructive"
							: "text-muted-foreground",
					)}
				>
					{draft.length}/{MAX_LENGTH}
				</div>
			</div>

			<p className="text-xs text-muted-foreground">
				This prompt will be added after the default system instructions. Leave
				empty to use only the defaults.
			</p>

			{/* Actions */}
			<div className="flex items-center gap-2">
				<Button
					className="w-full lg:w-auto"
					disabled={!hasChanges || draft.length > MAX_LENGTH}
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
