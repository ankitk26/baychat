import { marked } from "marked";
import { type HTMLAttributes, memo, useMemo } from "react";
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

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
	node?: unknown;
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
		node: _node,
		className,
		...props
	}: HeadingProps) {
		const mergedClass = `scroll-mt-6 ${className || ""}`.trim();

		switch (tag) {
			case "h1":
				return <h1 id={id} className={mergedClass} {...props} />;
			case "h2":
				return <h2 id={id} className={mergedClass} {...props} />;
			case "h3":
				return <h3 id={id} className={mergedClass} {...props} />;
			case "h4":
				return <h4 id={id} className={mergedClass} {...props} />;
			case "h5":
				return <h5 id={id} className={mergedClass} {...props} />;
			case "h6":
				return <h6 id={id} className={mergedClass} {...props} />;
			default:
				return null;
		}
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
			const HeadingComponent = makeHeadingWithId(tag, headingId);

			switch (tag) {
				case "h1":
					components.h1 = HeadingComponent;
					break;
				case "h2":
					components.h2 = HeadingComponent;
					break;
				case "h3":
					components.h3 = HeadingComponent;
					break;
				case "h4":
					components.h4 = HeadingComponent;
					break;
				case "h5":
					components.h5 = HeadingComponent;
					break;
				case "h6":
					components.h6 = HeadingComponent;
					break;
			}
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
