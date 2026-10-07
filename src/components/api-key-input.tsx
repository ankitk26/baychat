import { CheckCircleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import type { Provider } from "~/types";
import ApiKeyInputForm from "./api-key-input-form";
import ApiKeyInputIcon from "./api-key-input-icon";
import ApiKeyLink from "./api-key-link";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type Props = {
	provider: Provider;
	keyLink: string;
	isConfigured: boolean;
	maskedHint: string | null;
	isEditing: boolean;
	onReplace: () => void;
	onCancel: () => void;
	isRemoving: boolean;
	onClear: (provider: Provider) => Promise<boolean>;
	formValues: {
		label: string;
		placeholder?: string;
		value: string;
		onChange: (provider: Provider, value: string) => void;
	};
};

export default function ApiKeyInput(props: Props) {
	const [isRemoveAlertOpen, setIsRemoveAlertOpen] = useState(false);
	const showSavedState = props.isConfigured && !props.isEditing;

	const handleConfirmRemove = async () => {
		const removed = await props.onClear(props.provider);
		if (removed) setIsRemoveAlertOpen(false);
	};

	return (
		<div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
			<Label
				className="flex w-48 shrink-0 items-center gap-2 leading-normal text-muted-foreground"
				htmlFor={`api-key-${props.provider}`}
			>
				<ApiKeyInputIcon provider={props.provider} />
				<span className="truncate">{props.formValues.label}</span>
			</Label>

			<div className="flex-1 space-y-2">
				{showSavedState ? (
					<div className="flex flex-col justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center">
						<div className="flex min-w-0 items-center gap-3">
							<span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
								<CheckCircleIcon className="size-4" />
							</span>
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-sm font-medium">Key saved</p>
									<span className="rounded border bg-background/60 px-2 py-0.5 font-mono text-[11px] tracking-widest text-muted-foreground">
										{props.maskedHint ?? "********"}
									</span>
								</div>
								<p className="text-xs text-muted-foreground">
									Encrypted and synced across your devices
								</p>
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
							<Button onClick={props.onReplace} size="sm" variant="outline">
								Replace
							</Button>
							<AlertDialog
								onOpenChange={setIsRemoveAlertOpen}
								open={isRemoveAlertOpen}
							>
								<AlertDialogTrigger
									render={
										<Button
											className="text-destructive hover:text-destructive"
											size="sm"
											type="button"
											variant="ghost"
										/>
									}
								>
									Remove
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>Remove saved API key?</AlertDialogTitle>
										<AlertDialogDescription>
											This will remove the {props.formValues.label} from your
											account. You’ll need to add it again to use this provider.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel disabled={props.isRemoving}>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											disabled={props.isRemoving}
											onClick={() => void handleConfirmRemove()}
											variant="destructive"
										>
											{props.isRemoving ? "Removing…" : "Remove key"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>
				) : (
					<>
						<ApiKeyInputForm
							formValues={props.formValues}
							provider={props.provider}
						/>
						<div className="flex items-center justify-between gap-3">
							<ApiKeyLink keyLink={props.keyLink} />
							{props.isEditing && (
								<Button onClick={props.onCancel} size="sm" variant="ghost">
									Cancel
								</Button>
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							{props.isEditing
								? "Enter a new key to replace the saved one."
								: "Your key will be encrypted and synced to your account."}
						</p>
					</>
				)}
			</div>
		</div>
	);
}
