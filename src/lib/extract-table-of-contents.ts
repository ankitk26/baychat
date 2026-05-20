import { marked } from "marked";
import type { CustomUIMessage, TableOfContentsSection } from "~/types";

function getTextFromMessage(message: CustomUIMessage): string {
	return message.parts
		.filter((p) => p.type === "text")
		.map((p) => ("text" in p ? p.text : ""))
		.join(" ")
		.trim();
}

export function extractTableOfContents(
	messages: CustomUIMessage[],
): TableOfContentsSection[] {
	const sections: TableOfContentsSection[] = [];

	for (let i = 0; i < messages.length; i++) {
		const message = messages[i];
		if (message.role !== "user") continue;

		const userContent = getTextFromMessage(message);
		const preview =
			userContent.slice(0, 42) + (userContent.length > 42 ? "…" : "") ||
			"Empty message";

		const nextMessage = messages[i + 1];
		const headings: TableOfContentsSection["headings"] = [];
		let assistantId: string | undefined;

		if (nextMessage?.role === "assistant") {
			assistantId = nextMessage.id;
			const textParts = getTextFromMessage(nextMessage);

			try {
				const tokens = marked.lexer(textParts);
				let headingIndex = 0;
				for (const token of tokens) {
					if (token.type === "heading") {
						headings.push({
							text: token.text,
							depth: token.depth,
							headingId: `${assistantId}-heading-${headingIndex}`,
						});
						headingIndex++;
					}
				}
			} catch {
				// ignore markdown parsing errors
			}
		}

		sections.push({
			turnId: message.id,
			userPreview: preview,
			assistantId,
			headings,
		});
	}

	return sections;
}
