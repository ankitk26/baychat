import { PaperPlaneRightIcon, StopIcon } from "@phosphor-icons/react";
import type { ChatStatus } from "ai";
import InputUploadButton from "./input-upload-button";
import ModelSelector from "./model-selector";
import { Button } from "./ui/button";
import WebSearchButton from "./web-search-button";

type Props = {
	attachmentCount?: number;
	disabled?: boolean;
	isUploading?: boolean;
	onAttachClick?: () => void;
	status: ChatStatus;
	stop: () => void;
};

export default function PromptActions({
	attachmentCount = 0,
	disabled = false,
	isUploading = false,
	onAttachClick,
	status,
	stop,
}: Props) {
	return (
		<div className="mt-3 flex flex-row items-center justify-between gap-2 lg:mt-4">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<ModelSelector />

				<WebSearchButton />

				<InputUploadButton
					attachmentCount={attachmentCount}
					disabled={disabled}
					isUploading={isUploading}
					onAttachClick={onAttachClick}
				/>
			</div>

			{status === "streaming" || status === "submitted" ? (
				<Button onClick={stop} size="icon" type="button">
					<StopIcon />
				</Button>
			) : (
				<Button size="icon" type="submit" variant="outline">
					<PaperPlaneRightIcon />
				</Button>
			)}
		</div>
	);
}
