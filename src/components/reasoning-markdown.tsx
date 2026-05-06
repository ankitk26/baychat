import MemoizedMarkdown from "./memoized-markdown";

type Props = {
	messageId: string;
	reasoningContent: string;
};

export default function ReasoningMarkdown(props: Props) {
	return (
		<div className="prose w-full max-w-full rounded-md border bg-popover p-4 font-mono text-xs leading-6 prose-neutral prose-amber dark:prose-invert prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0">
			<MemoizedMarkdown content={props.reasoningContent} id={props.messageId} />
		</div>
	);
}
