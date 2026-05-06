import MemoizedMarkdown from "./memoized-markdown";

type Props = {
	messageId: string;
	messageContent: string;
};

export default function AIResponseContent({
	messageContent,
	messageId,
}: Props) {
	return (
		<div className="relative px-0 lg:-mx-2 lg:px-2">
			<div className="prose prose-sm w-full max-w-full leading-7 wrap-break-word prose-neutral prose-amber select-text lg:leading-8 dark:prose-invert prose-pre:bg-transparent prose-pre:p-0 [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto">
				<MemoizedMarkdown content={messageContent} id={messageId} />
			</div>
		</div>
	);
}
