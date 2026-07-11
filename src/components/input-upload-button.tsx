import { SpinnerIcon, PaperclipIcon } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

type Props = {
	attachmentCount?: number;
	disabled?: boolean;
	isUploading?: boolean;
	onAttachClick?: () => void;
};

export default function InputUploadButton({
	attachmentCount,
	disabled,
	isUploading,
	onAttachClick,
}: Props) {
	const hasAttachments = (attachmentCount ?? 0) > 0;

	return (
		<Button
			className={cn(
				"transition-all duration-300 ease-out",
				hasAttachments && "border-primary/60 bg-primary/8 text-foreground",
			)}
			disabled={disabled}
			onClick={onAttachClick}
			type="button"
			variant="outline"
		>
			{isUploading ? (
				<>
					<SpinnerIcon className="size-4 animate-spin" />
					<span className="hidden sm:inline">Uploading...</span>
				</>
			) : (
				<>
					<PaperclipIcon />
					<span className="hidden sm:inline">Upload</span>
				</>
			)}
			{!isUploading && hasAttachments && (
				<span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] leading-none text-background">
					{attachmentCount}
				</span>
			)}
		</Button>
	);
}
