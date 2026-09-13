import { api } from "convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import ReadOnlyAssistantMessage from "~/components/read-only-assistant-message";
import ReadOnlyUserMessage from "~/components/read-only-user-message";
import SaveMessageButton from "~/components/save-message-button";

type SavedMessage = FunctionReturnType<
	typeof api.savedMessages.getSavedMessagesByChat
>[0];

type Props = {
	savedMessage: SavedMessage;
};

// Renders one saved message the same way it appears in the real chat, with
// the save toggle added to the message's action row.
export default function SavedMessageItem({ savedMessage }: Props) {
	const message = {
		_id: savedMessage._id,
		_creationTime: savedMessage._creationTime,
		chatId: savedMessage.chatId,
		sourceMessageId: savedMessage.messageId,
		parts: savedMessage.parts,
		metadata: savedMessage.metadata,
		role: savedMessage.role,
	};

	const saveAction = (
		<SaveMessageButton
			chatId={savedMessage.chatId}
			messageId={savedMessage.messageId}
		/>
	);

	return savedMessage.role === "user" ? (
		<div className="flex flex-col">
			<ReadOnlyUserMessage message={message} extraActions={saveAction} />
		</div>
	) : (
		<ReadOnlyAssistantMessage message={message} extraActions={saveAction} />
	);
}
