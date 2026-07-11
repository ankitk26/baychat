import { DownloadIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { Id } from "convex/_generated/dataModel";
import { Tooltip, TooltipContent, TooltipTrigger } from "./app-tooltip";
import DeleteImageGenerationButton from "./delete-image-generation-button";
import { Button } from "./ui/button";

type Props = {
	handleDownload: () => void;
	handleShare: () => void;
	storageId?: Id<"_storage">;
};

export default function GeneratedImageViewerDesktopActions(props: Props) {
	return (
		<div
			className="absolute right-0 bottom-0 left-0 hidden items-center justify-center gap-2 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:flex"
			onClick={(e) => e.stopPropagation()}
		>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/20 hover:text-white hover:backdrop-blur-sm"
							onClick={props.handleDownload}
						>
							<DownloadIcon className="h-4 w-4" />
						</Button>
					}
				/>
				<TooltipContent side="bottom">Download</TooltipContent>
			</Tooltip>

			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className="text-white hover:bg-white/20 hover:text-white hover:backdrop-blur-sm"
							onClick={props.handleShare}
						>
							<ShareNetworkIcon className="h-4 w-4" />
						</Button>
					}
				/>
				<TooltipContent side="bottom">Copy link</TooltipContent>
			</Tooltip>

			{props.storageId ? (
				<DeleteImageGenerationButton storageId={props.storageId} />
			) : null}
		</div>
	);
}
