import type { ReactNode } from "react";
import { ScrollArea } from "~/components/app-scroll-area";
import { useContentWidth } from "~/hooks/use-content-width";
import { cn } from "~/lib/utils";

type PageShellProps = {
	/** Max-width class applied when the content width toggle is collapsed. */
	collapsedWidthClass: string;
	/** Max-width class applied when the content width toggle is expanded. */
	expandedWidthClass: string;
	/** Extra classes merged into the content container (e.g. custom lg padding). */
	className?: string;
	children: ReactNode;
};

/**
 * Shared scrollable page layout for pages rendered inside the sidebar inset.
 * Mirrors the chat page spacing: `pt-14` clears the fixed floating header on
 * mobile, `md:pt-0` drops it once the header turns transparent on desktop.
 */
export default function PageShell({
	collapsedWidthClass,
	expandedWidthClass,
	className,
	children,
}: PageShellProps) {
	const contentWidth = useContentWidth(collapsedWidthClass, expandedWidthClass);

	return (
		<section className="h-svh max-h-svh">
			<ScrollArea className="h-full w-full">
				<div
					className={cn(
						"mx-auto min-h-full w-full max-w-full px-4 pt-14 pb-20 transition-[max-width] duration-300 ease-in-out md:pt-0 lg:px-6 lg:pb-12",
						contentWidth,
						className,
					)}
				>
					{children}
				</div>
			</ScrollArea>
		</section>
	);
}
