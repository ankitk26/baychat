import * as React from "react";
import { ScrollArea as ShadcnScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

interface ScrollAreaProps extends React.ComponentProps<
	typeof ShadcnScrollArea
> {
	viewportRef?: React.Ref<HTMLDivElement>;
}

function assignViewportRef(
	viewportRef: React.Ref<HTMLDivElement> | undefined,
	viewport: HTMLDivElement | null,
) {
	if (!viewportRef) return;

	if ("current" in viewportRef) {
		viewportRef.current = viewport;
		return;
	}

	viewportRef(viewport);
}

function ScrollArea({
	className,
	children,
	viewportRef,
	...props
}: ScrollAreaProps) {
	const setWrapperRef = React.useCallback(
		(node: HTMLDivElement | null) => {
			const viewport = node?.querySelector<HTMLDivElement>(
				'[data-slot="scroll-area-viewport"]',
			);

			assignViewportRef(viewportRef, viewport ?? null);
		},
		[viewportRef],
	);

	return (
		<div ref={setWrapperRef} className="contents">
			<ShadcnScrollArea className={cn(className)} {...props}>
				{children}
			</ShadcnScrollArea>
		</div>
	);
}

export { ScrollArea };
