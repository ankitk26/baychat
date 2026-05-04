import type { ChatStatus } from "ai";
import { useState } from "react";
import type { CustomUIMessage } from "~/types";
import ReasoningMarkdown from "./reasoning-markdown";
import ReasoningToggleButton from "./reasoning-toggle-button";

type Props = {
	parts: CustomUIMessage["parts"];
	messageContent: string;
	messageId: string;
	status?: ChatStatus;
};

export default function AIResponseReasoning(props: Props) {
	const [showReasoning, setShowReasoning] = useState(false);
	const reasoningPart = props.parts.find((part) => part.type === "reasoning");

	const toggleReasoningDisplay = () => {
		setShowReasoning((prev) => !prev);
	};

	if (!reasoningPart) {
		return null;
	}

	const isStreaming =
		"state" in reasoningPart &&
		reasoningPart.state === "streaming" &&
		(props.status === "streaming" || props.status === "submitted");

	return (
		<div className="space-y-2">
			<ReasoningToggleButton
				isStreaming={isStreaming}
				showReasoning={showReasoning}
				toggleReasoningDisplay={toggleReasoningDisplay}
			/>

			{showReasoning && (
				<ReasoningMarkdown
					messageId={props.messageId}
					reasoningContent={reasoningPart.text}
				/>
			)}
		</div>
	);
}
