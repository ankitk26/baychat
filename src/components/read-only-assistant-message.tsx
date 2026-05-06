import { CopyIcon } from "@phosphor-icons/react";
import type { Doc } from "convex/_generated/dataModel";
import { toast } from "sonner";
import { getMessageContentFromParts } from "~/lib/get-message-content-from-parts";
import type { CustomUIMessage } from "~/types";
import AIResponseContent from "./ai-response-content";
import AIResponseReasoning from "./ai-response-reasoning";
import AIResponseSources from "./ai-response-sources";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
	message: Omit<Doc<"messages">, "userId">;
};

export default function ReadOnlyAssistantMessage({ message }: Props) {
	const messageMetadata = JSON.parse(
		message.metadata ?? "{}",
	) as CustomUIMessage["metadata"];

	const messageContent = getMessageContentFromParts(JSON.parse(message.parts));
	const messageId = message.sourceMessageId;
	const messageParts = JSON.parse(message.parts) as CustomUIMessage["parts"];

	return (
		<div className="group space-y-6">
			<AIResponseReasoning
				messageContent={messageContent}
				messageId={messageId}
				parts={messageParts}
			/>
			<AIResponseContent
				messageContent={messageContent}
				messageId={messageId}
			/>
			<AIResponseSources parts={messageParts} />
			<div className="flex items-center gap-6 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
				<div className="flex items-center gap-1">
					<Tooltip>
						<TooltipTrigger
							render={
								<Button
									onClick={async () => {
										await navigator.clipboard.writeText(messageContent);
										toast.success("Copied to clipboard");
									}}
									size="icon"
									variant="ghost"
								/>
							}
						>
							<CopyIcon />
						</TooltipTrigger>
						<TooltipContent>Copy to clipboard</TooltipContent>
					</Tooltip>

					<span className="text-xs text-muted-foreground">
						{messageMetadata?.modelName}
					</span>
				</div>
			</div>
		</div>
	);
}
