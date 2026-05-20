import { marked } from "marked";
import { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import CodeHighlight from "./code-highlight";

type Block = {
	raw: string;
	headingId?: string;
	headingDepth?: number;
};

function parseMarkdownIntoBlocks(markdown: string, messageId: string): Block[] {
	const tokens = marked.lexer(markdown);
	let headingIndex = 0;
	return tokens.map((token) => {
		if (token.type === "heading") {
			const id = `${messageId}-heading-${headingIndex}`;
			headingIndex++;
			return {
				raw: token.raw,
				headingId: id,
				headingDepth: token.depth,
			};
		}
		return { raw: token.raw };
	});
}

function makeHeadingWithId(tag: string, id: string) {
	return function HeadingWithId({
		_node,
		className,
		...props
	}: Record<string, unknown>) {
		const Tag = tag as keyof JSX.IntrinsicElements;
		const mergedClass = `scroll-mt-6 ${(className as string) || ""}`.trim();
		return <Tag id={id} className={mergedClass} {...props} />;
	};
}

const MemoizedMarkdownBlock = memo(
	({
		content,
		headingId,
		headingDepth,
	}: {
		content: string;
		headingId?: string;
		headingDepth?: number;
	}) => {
		const components: Partial<Components> = {
			code: CodeHighlight,
		};

		if (headingId && headingDepth) {
			const tag = `h${headingDepth}`;
			components[tag as keyof Components] = makeHeadingWithId(
				tag,
				headingId,
			) as Components[keyof Components];
		}

		return (
			<ReactMarkdown
				components={components}
				rehypePlugins={[rehypeKatex]}
				remarkPlugins={[remarkGfm, remarkMath]}
			>
				{content}
			</ReactMarkdown>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.content === nextProps.content &&
			prevProps.headingId === nextProps.headingId &&
			prevProps.headingDepth === nextProps.headingDepth
		);
	},
);

type Props = {
	content: string;
	id: string;
};

export default memo(function MemoizedMarkdown({ content, id }: Props) {
	const blocks = useMemo(
		() => parseMarkdownIntoBlocks(content, id),
		[content, id],
	);

	return blocks.map((block, index) => {
		const key = `${id}-block_${index}`;
		return (
			<MemoizedMarkdownBlock
				content={block.raw}
				key={key}
				headingId={block.headingId}
				headingDepth={block.headingDepth}
			/>
		);
	});
});
